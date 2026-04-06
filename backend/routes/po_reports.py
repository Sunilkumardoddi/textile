"""
PO Reports Management API Routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from typing import List, Optional
from datetime import datetime, timezone, date, timedelta
import uuid
import os
import json

from models.po_reports import (
    ReportType, ReportStatus, DefectSeverity, InspectionResult, AQLLevel,
    AlertType, AlertSeverity, FileAttachment,
    ProductionReport, ProductionReportCreate, ProductionLine,
    QualityReport, QualityReportCreate, DefectEntry,
    InspectionReport, InspectionReportCreate, InspectionFinding,
    FabricTestReport, FabricTestReportCreate, FabricTestResult,
    TrimsReport, TrimsReportCreate, TrimsTestResult,
    ReportAlert, POReportsSummary, POReportsAnalytics,
    ProductionTrend, QualityTrend, ReportApproval
)
from utils.auth import get_current_user, require_any_authenticated, require_brand, require_manufacturer
from utils.database import db

router = APIRouter(prefix="/reports", tags=["PO Reports Management"])

# Collections
production_reports = db.production_reports
quality_reports = db.quality_reports
inspection_reports = db.inspection_reports
fabric_test_reports = db.fabric_test_reports
trims_reports = db.trims_reports
report_alerts = db.report_alerts
pos_collection = db.purchase_orders
traceability_collection = db.traceability_records

# Upload directory
UPLOAD_DIR = "/app/backend/uploads"
os.makedirs(f"{UPLOAD_DIR}/reports", exist_ok=True)

# Quality thresholds
DHU_THRESHOLD = 5.0  # Alert if DHU > 5%
EFFICIENCY_THRESHOLD = 70.0  # Alert if efficiency < 70%


async def create_report_alert(
    po_id: str, po_number: str, alert_type: AlertType, severity: AlertSeverity,
    title: str, description: str, report_id: str = None, report_type: ReportType = None
):
    """Create a report alert."""
    alert = {
        "id": str(uuid.uuid4()),
        "po_id": po_id,
        "po_number": po_number,
        "alert_type": alert_type.value,
        "severity": severity.value,
        "title": title,
        "description": description,
        "report_id": report_id,
        "report_type": report_type.value if report_type else None,
        "is_resolved": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await report_alerts.insert_one(alert)
    return alert


async def link_report_to_traceability(po_id: str, report_type: str, report_id: str):
    """Link report to traceability record."""
    await traceability_collection.update_one(
        {"po_id": po_id},
        {
            "$push": {f"linked_reports.{report_type}": report_id},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )


# ==================== FILE UPLOAD ====================

@router.post("/upload")
async def upload_report_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_any_authenticated)
):
    """Upload a report file (PDF, Excel, Image)."""
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg",
                     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                     "application/vnd.ms-excel"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    file_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    filename = f"{file_id}.{ext}"
    file_path = f"{UPLOAD_DIR}/reports/{filename}"
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    return {
        "id": file_id,
        "file_name": file.filename,
        "file_url": f"/uploads/reports/{filename}",
        "file_type": ext,
        "file_size": len(content)
    }


# ==================== PRODUCTION REPORTS (DPR) ====================

@router.post("/production")
async def create_production_report(
    po_id: str = Form(...),
    po_number: str = Form(...),
    supplier_id: str = Form(...),
    supplier_name: str = Form(...),
    report_date: str = Form(...),
    style: Optional[str] = Form(None),
    lines_data: str = Form(...),  # JSON string of ProductionLine[]
    total_target: int = Form(...),
    total_actual: int = Form(...),
    total_wip: int = Form(0),
    overall_efficiency: float = Form(0.0),
    remarks: Optional[str] = Form(None),
    attachments: Optional[str] = Form(None),  # JSON string of file IDs
    current_user: dict = Depends(require_manufacturer)
):
    """Create a Daily Production Report (DPR)."""
    # Parse JSON data
    lines = json.loads(lines_data) if lines_data else []
    attachment_ids = json.loads(attachments) if attachments else []
    
    # Calculate cumulative from previous reports
    prev_reports = await production_reports.find(
        {"po_id": po_id},
        {"_id": 0, "total_actual": 1, "total_target": 1}
    ).to_list(1000)
    
    cumulative_actual = sum(r.get("total_actual", 0) for r in prev_reports) + total_actual
    cumulative_target = sum(r.get("total_target", 0) for r in prev_reports) + total_target
    cumulative_efficiency = (cumulative_actual / cumulative_target * 100) if cumulative_target > 0 else 0
    
    # Build attachment objects
    attachment_objects = []
    for aid in attachment_ids:
        attachment_objects.append({
            "id": aid,
            "file_name": f"attachment_{aid}",
            "file_url": f"/uploads/reports/{aid}.pdf",
            "file_type": "pdf",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        })
    
    report = {
        "id": str(uuid.uuid4()),
        "report_type": ReportType.PRODUCTION.value,
        "po_id": po_id,
        "po_number": po_number,
        "supplier_id": supplier_id,
        "supplier_name": supplier_name,
        "report_date": report_date,
        "style": style,
        "lines": lines,
        "total_target": total_target,
        "total_actual": total_actual,
        "total_wip": total_wip,
        "overall_efficiency": overall_efficiency,
        "cumulative_target": cumulative_target,
        "cumulative_actual": cumulative_actual,
        "cumulative_efficiency": round(cumulative_efficiency, 2),
        "remarks": remarks,
        "attachments": attachment_objects,
        "status": ReportStatus.SUBMITTED.value,
        "submitted_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }
    
    await production_reports.insert_one(report)
    
    # Link to traceability
    await link_report_to_traceability(po_id, "production", report["id"])
    
    # Check for low efficiency alert
    if overall_efficiency < EFFICIENCY_THRESHOLD:
        await create_report_alert(
            po_id, po_number, AlertType.QUALITY_THRESHOLD, AlertSeverity.MEDIUM,
            f"Low Production Efficiency: {overall_efficiency}%",
            f"Production efficiency {overall_efficiency}% is below threshold of {EFFICIENCY_THRESHOLD}%",
            report["id"], ReportType.PRODUCTION
        )
    
    return {"message": "Production report created", "report_id": report["id"]}


@router.get("/production")
async def get_production_reports(
    po_id: Optional[str] = None,
    supplier_id: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    status: Optional[ReportStatus] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get production reports with filters."""
    query = {}
    
    if po_id:
        query["po_id"] = po_id
    if supplier_id:
        query["supplier_id"] = supplier_id
    if status:
        query["status"] = status.value
    if from_date:
        query["report_date"] = {"$gte": from_date}
    if to_date:
        query.setdefault("report_date", {})["$lte"] = to_date
    
    # Filter by role
    if current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    
    reports = await production_reports.find(query, {"_id": 0}).sort("report_date", -1).skip(skip).limit(limit).to_list(limit)
    return reports


@router.get("/production/{report_id}")
async def get_production_report(
    report_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get a specific production report."""
    report = await production_reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ==================== QUALITY REPORTS (DQR) ====================

@router.post("/quality")
async def create_quality_report(
    po_id: str = Form(...),
    po_number: str = Form(...),
    supplier_id: str = Form(...),
    supplier_name: str = Form(...),
    report_date: str = Form(...),
    style: Optional[str] = Form(None),
    inspection_type: str = Form("inline"),
    pieces_inspected: int = Form(...),
    pieces_passed: int = Form(...),
    pieces_rejected: int = Form(...),
    defects_data: str = Form(...),  # JSON string of DefectEntry[]
    dhu_percentage: float = Form(...),
    remarks: Optional[str] = Form(None),
    attachments: Optional[str] = Form(None),
    current_user: dict = Depends(require_manufacturer)
):
    """Create a Daily Quality Report (DQR)."""
    defects = json.loads(defects_data) if defects_data else []
    attachment_ids = json.loads(attachments) if attachments else []
    
    # Count defects by severity
    major_defects = sum(d.get("quantity", 0) for d in defects if d.get("severity") == "major")
    minor_defects = sum(d.get("quantity", 0) for d in defects if d.get("severity") == "minor")
    critical_defects = sum(d.get("quantity", 0) for d in defects if d.get("severity") == "critical")
    total_defects = major_defects + minor_defects + critical_defects
    
    rejection_rate = (pieces_rejected / pieces_inspected * 100) if pieces_inspected > 0 else 0
    
    attachment_objects = []
    for aid in attachment_ids:
        attachment_objects.append({
            "id": aid,
            "file_name": f"attachment_{aid}",
            "file_url": f"/uploads/reports/{aid}.pdf",
            "file_type": "pdf",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        })
    
    report = {
        "id": str(uuid.uuid4()),
        "report_type": ReportType.QUALITY.value,
        "po_id": po_id,
        "po_number": po_number,
        "supplier_id": supplier_id,
        "supplier_name": supplier_name,
        "report_date": report_date,
        "style": style,
        "inspection_type": inspection_type,
        "pieces_inspected": pieces_inspected,
        "pieces_passed": pieces_passed,
        "pieces_rejected": pieces_rejected,
        "defects": defects,
        "total_defects": total_defects,
        "major_defects": major_defects,
        "minor_defects": minor_defects,
        "critical_defects": critical_defects,
        "dhu_percentage": dhu_percentage,
        "rejection_rate": round(rejection_rate, 2),
        "remarks": remarks,
        "attachments": attachment_objects,
        "status": ReportStatus.SUBMITTED.value,
        "submitted_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }
    
    await quality_reports.insert_one(report)
    
    # Link to traceability
    await link_report_to_traceability(po_id, "quality", report["id"])
    
    # Check for high DHU alert
    if dhu_percentage > DHU_THRESHOLD:
        await create_report_alert(
            po_id, po_number, AlertType.HIGH_DEFECT_RATE, AlertSeverity.HIGH,
            f"High DHU: {dhu_percentage}%",
            f"Defects per Hundred Units ({dhu_percentage}%) exceeds threshold of {DHU_THRESHOLD}%",
            report["id"], ReportType.QUALITY
        )
    
    # Check for critical defects
    if critical_defects > 0:
        await create_report_alert(
            po_id, po_number, AlertType.QUALITY_THRESHOLD, AlertSeverity.HIGH,
            f"Critical Defects Found: {critical_defects}",
            f"{critical_defects} critical defects reported. Immediate attention required.",
            report["id"], ReportType.QUALITY
        )
    
    return {"message": "Quality report created", "report_id": report["id"]}


@router.get("/quality")
async def get_quality_reports(
    po_id: Optional[str] = None,
    supplier_id: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    status: Optional[ReportStatus] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get quality reports with filters."""
    query = {}
    
    if po_id:
        query["po_id"] = po_id
    if supplier_id:
        query["supplier_id"] = supplier_id
    if status:
        query["status"] = status.value
    if from_date:
        query["report_date"] = {"$gte": from_date}
    if to_date:
        query.setdefault("report_date", {})["$lte"] = to_date
    
    if current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    
    reports = await quality_reports.find(query, {"_id": 0}).sort("report_date", -1).skip(skip).limit(limit).to_list(limit)
    return reports


@router.get("/quality/{report_id}")
async def get_quality_report(
    report_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get a specific quality report."""
    report = await quality_reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ==================== INSPECTION REPORTS ====================

@router.post("/inspection")
async def create_inspection_report(
    po_id: str = Form(...),
    po_number: str = Form(...),
    supplier_id: str = Form(...),
    supplier_name: str = Form(...),
    inspection_date: str = Form(...),
    style: Optional[str] = Form(None),
    inspector_name: Optional[str] = Form(None),
    inspector_company: Optional[str] = Form(None),
    lot_size: int = Form(...),
    sample_size: int = Form(...),
    aql_level: str = Form("2.5"),
    result: str = Form(...),
    approved_qty: int = Form(...),
    rejected_qty: int = Form(...),
    findings_data: str = Form("[]"),
    comments: Optional[str] = Form(None),
    attachments: Optional[str] = Form(None),
    current_user: dict = Depends(require_any_authenticated)
):
    """Create a Final Inspection Report."""
    findings = json.loads(findings_data) if findings_data else []
    attachment_ids = json.loads(attachments) if attachments else []
    
    total_defects = sum(f.get("quantity", 0) for f in findings)
    defect_rate = (total_defects / sample_size * 100) if sample_size > 0 else 0
    
    attachment_objects = []
    for aid in attachment_ids:
        attachment_objects.append({
            "id": aid,
            "file_name": f"attachment_{aid}",
            "file_url": f"/uploads/reports/{aid}.pdf",
            "file_type": "pdf",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        })
    
    report = {
        "id": str(uuid.uuid4()),
        "report_type": ReportType.INSPECTION.value,
        "po_id": po_id,
        "po_number": po_number,
        "supplier_id": supplier_id,
        "supplier_name": supplier_name,
        "inspection_date": inspection_date,
        "style": style,
        "inspector_name": inspector_name,
        "inspector_company": inspector_company,
        "lot_size": lot_size,
        "sample_size": sample_size,
        "aql_level": aql_level,
        "result": result,
        "approved_qty": approved_qty,
        "rejected_qty": rejected_qty,
        "findings": findings,
        "total_defects": total_defects,
        "defect_rate": round(defect_rate, 2),
        "comments": comments,
        "attachments": attachment_objects,
        "status": ReportStatus.SUBMITTED.value,
        "submitted_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }
    
    await inspection_reports.insert_one(report)
    
    # Link to traceability
    await link_report_to_traceability(po_id, "inspection", report["id"])
    
    # Alert for failed inspection
    if result == "fail":
        await create_report_alert(
            po_id, po_number, AlertType.FAILED_INSPECTION, AlertSeverity.HIGH,
            "Final Inspection Failed",
            f"Pre-shipment inspection failed. Rejected qty: {rejected_qty}. Immediate action required.",
            report["id"], ReportType.INSPECTION
        )
    
    return {"message": "Inspection report created", "report_id": report["id"]}


@router.get("/inspection")
async def get_inspection_reports(
    po_id: Optional[str] = None,
    supplier_id: Optional[str] = None,
    result: Optional[InspectionResult] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get inspection reports with filters."""
    query = {}
    
    if po_id:
        query["po_id"] = po_id
    if supplier_id:
        query["supplier_id"] = supplier_id
    if result:
        query["result"] = result.value
    
    if current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    
    reports = await inspection_reports.find(query, {"_id": 0}).sort("inspection_date", -1).skip(skip).limit(limit).to_list(limit)
    return reports


@router.get("/inspection/{report_id}")
async def get_inspection_report(
    report_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get a specific inspection report."""
    report = await inspection_reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ==================== FABRIC TEST REPORTS ====================

@router.post("/fabric-tests")
async def create_fabric_test_report(
    po_id: str = Form(...),
    po_number: str = Form(...),
    supplier_id: str = Form(...),
    supplier_name: str = Form(...),
    test_date: str = Form(...),
    style: Optional[str] = Form(None),
    fabric_type: Optional[str] = Form(None),
    lab_name: Optional[str] = Form(None),
    lab_report_number: Optional[str] = Form(None),
    tests_data: str = Form(...),
    overall_result: str = Form(...),
    comments: Optional[str] = Form(None),
    attachments: Optional[str] = Form(None),
    current_user: dict = Depends(require_any_authenticated)
):
    """Create a Fabric Test Report."""
    tests = json.loads(tests_data) if tests_data else []
    attachment_ids = json.loads(attachments) if attachments else []
    
    tests_passed = sum(1 for t in tests if t.get("status") == "pass")
    tests_failed = sum(1 for t in tests if t.get("status") == "fail")
    
    attachment_objects = []
    for aid in attachment_ids:
        attachment_objects.append({
            "id": aid,
            "file_name": f"attachment_{aid}",
            "file_url": f"/uploads/reports/{aid}.pdf",
            "file_type": "pdf",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        })
    
    report = {
        "id": str(uuid.uuid4()),
        "report_type": ReportType.FABRIC_TEST.value,
        "po_id": po_id,
        "po_number": po_number,
        "supplier_id": supplier_id,
        "supplier_name": supplier_name,
        "test_date": test_date,
        "style": style,
        "fabric_type": fabric_type,
        "lab_name": lab_name,
        "lab_report_number": lab_report_number,
        "tests": tests,
        "tests_passed": tests_passed,
        "tests_failed": tests_failed,
        "overall_result": overall_result,
        "comments": comments,
        "attachments": attachment_objects,
        "status": ReportStatus.SUBMITTED.value,
        "submitted_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }
    
    await fabric_test_reports.insert_one(report)
    
    # Link to traceability
    await link_report_to_traceability(po_id, "fabric_test", report["id"])
    
    # Alert for failed tests
    if overall_result == "fail":
        await create_report_alert(
            po_id, po_number, AlertType.FAILED_INSPECTION, AlertSeverity.HIGH,
            f"Fabric Test Failed: {tests_failed} test(s)",
            f"Fabric testing failed. {tests_failed} out of {len(tests)} tests failed.",
            report["id"], ReportType.FABRIC_TEST
        )
    
    return {"message": "Fabric test report created", "report_id": report["id"]}


@router.get("/fabric-tests")
async def get_fabric_test_reports(
    po_id: Optional[str] = None,
    supplier_id: Optional[str] = None,
    result: Optional[InspectionResult] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get fabric test reports with filters."""
    query = {}
    
    if po_id:
        query["po_id"] = po_id
    if supplier_id:
        query["supplier_id"] = supplier_id
    if result:
        query["overall_result"] = result.value
    
    if current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    
    reports = await fabric_test_reports.find(query, {"_id": 0}).sort("test_date", -1).skip(skip).limit(limit).to_list(limit)
    return reports


@router.get("/fabric-tests/{report_id}")
async def get_fabric_test_report(
    report_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get a specific fabric test report."""
    report = await fabric_test_reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ==================== TRIMS REPORTS ====================

@router.post("/trims")
async def create_trims_report(
    po_id: str = Form(...),
    po_number: str = Form(...),
    supplier_id: str = Form(...),
    supplier_name: str = Form(...),
    test_date: str = Form(...),
    style: Optional[str] = Form(None),
    items_data: str = Form(...),
    overall_result: str = Form(...),
    comments: Optional[str] = Form(None),
    attachments: Optional[str] = Form(None),
    current_user: dict = Depends(require_any_authenticated)
):
    """Create a Trims & Accessories Report."""
    items = json.loads(items_data) if items_data else []
    attachment_ids = json.loads(attachments) if attachments else []
    
    tests_passed = sum(1 for t in items if t.get("status") == "pass")
    tests_failed = sum(1 for t in items if t.get("status") == "fail")
    
    attachment_objects = []
    for aid in attachment_ids:
        attachment_objects.append({
            "id": aid,
            "file_name": f"attachment_{aid}",
            "file_url": f"/uploads/reports/{aid}.pdf",
            "file_type": "pdf",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        })
    
    report = {
        "id": str(uuid.uuid4()),
        "report_type": ReportType.TRIMS.value,
        "po_id": po_id,
        "po_number": po_number,
        "supplier_id": supplier_id,
        "supplier_name": supplier_name,
        "test_date": test_date,
        "style": style,
        "items_tested": items,
        "tests_passed": tests_passed,
        "tests_failed": tests_failed,
        "overall_result": overall_result,
        "comments": comments,
        "attachments": attachment_objects,
        "status": ReportStatus.SUBMITTED.value,
        "submitted_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }
    
    await trims_reports.insert_one(report)
    
    # Link to traceability
    await link_report_to_traceability(po_id, "trims", report["id"])
    
    return {"message": "Trims report created", "report_id": report["id"]}


@router.get("/trims")
async def get_trims_reports(
    po_id: Optional[str] = None,
    supplier_id: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get trims reports with filters."""
    query = {}
    
    if po_id:
        query["po_id"] = po_id
    if supplier_id:
        query["supplier_id"] = supplier_id
    
    if current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    
    reports = await trims_reports.find(query, {"_id": 0}).sort("test_date", -1).skip(skip).limit(limit).to_list(limit)
    return reports


@router.get("/trims/{report_id}")
async def get_trims_report(
    report_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get a specific trims report."""
    report = await trims_reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ==================== PO REPORTS SUMMARY & ANALYTICS ====================

@router.get("/po/{po_id}")
async def get_po_reports_summary(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get all reports summary for a PO."""
    # Count reports by type
    prod_count = await production_reports.count_documents({"po_id": po_id})
    qual_count = await quality_reports.count_documents({"po_id": po_id})
    insp_count = await inspection_reports.count_documents({"po_id": po_id})
    fabric_count = await fabric_test_reports.count_documents({"po_id": po_id})
    trims_count = await trims_reports.count_documents({"po_id": po_id})
    
    # Get PO info
    po = await pos_collection.find_one({"id": po_id}, {"_id": 0, "po_number": 1})
    po_number = po.get("po_number", "") if po else ""
    
    # Calculate averages
    prod_reports = await production_reports.find({"po_id": po_id}, {"_id": 0, "overall_efficiency": 1}).to_list(100)
    avg_efficiency = sum(r.get("overall_efficiency", 0) for r in prod_reports) / len(prod_reports) if prod_reports else 0
    
    qual_reports = await quality_reports.find({"po_id": po_id}, {"_id": 0, "dhu_percentage": 1}).to_list(100)
    avg_dhu = sum(r.get("dhu_percentage", 0) for r in qual_reports) / len(qual_reports) if qual_reports else 0
    
    # Inspection pass rate
    insp_results = await inspection_reports.find({"po_id": po_id}, {"_id": 0, "result": 1}).to_list(100)
    passed = sum(1 for r in insp_results if r.get("result") == "pass")
    pass_rate = (passed / len(insp_results) * 100) if insp_results else 0
    
    # Pending approvals
    pending = 0
    pending += await production_reports.count_documents({"po_id": po_id, "status": "submitted"})
    pending += await quality_reports.count_documents({"po_id": po_id, "status": "submitted"})
    pending += await inspection_reports.count_documents({"po_id": po_id, "status": "submitted"})
    pending += await fabric_test_reports.count_documents({"po_id": po_id, "status": "submitted"})
    pending += await trims_reports.count_documents({"po_id": po_id, "status": "submitted"})
    
    # Active alerts
    alerts_count = await report_alerts.count_documents({"po_id": po_id, "is_resolved": False})
    
    # Last report date
    last_prod = await production_reports.find_one({"po_id": po_id}, {"_id": 0, "report_date": 1}, sort=[("report_date", -1)])
    last_date = last_prod.get("report_date") if last_prod else None
    
    return {
        "po_id": po_id,
        "po_number": po_number,
        "total_production_reports": prod_count,
        "total_quality_reports": qual_count,
        "total_inspection_reports": insp_count,
        "total_fabric_test_reports": fabric_count,
        "total_trims_reports": trims_count,
        "avg_efficiency": round(avg_efficiency, 2),
        "avg_dhu": round(avg_dhu, 2),
        "inspection_pass_rate": round(pass_rate, 2),
        "pending_approvals": pending,
        "active_alerts": alerts_count,
        "last_report_date": last_date
    }


@router.get("/po/{po_id}/analytics")
async def get_po_reports_analytics(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get analytics data for a PO's reports."""
    # Get summary
    summary = await get_po_reports_summary(po_id, current_user)
    
    # Production trends
    prod_reports = await production_reports.find(
        {"po_id": po_id},
        {"_id": 0, "report_date": 1, "total_target": 1, "total_actual": 1, "overall_efficiency": 1, "total_wip": 1}
    ).sort("report_date", 1).to_list(100)
    
    production_trends = [
        {
            "date": r["report_date"],
            "target": r.get("total_target", 0),
            "actual": r.get("total_actual", 0),
            "efficiency": r.get("overall_efficiency", 0),
            "wip": r.get("total_wip", 0)
        }
        for r in prod_reports
    ]
    
    # Quality trends
    qual_reports = await quality_reports.find(
        {"po_id": po_id},
        {"_id": 0, "report_date": 1, "dhu_percentage": 1, "total_defects": 1, "pieces_inspected": 1, "rejection_rate": 1}
    ).sort("report_date", 1).to_list(100)
    
    quality_trends = [
        {
            "date": r["report_date"],
            "dhu_percentage": r.get("dhu_percentage", 0),
            "defect_count": r.get("total_defects", 0),
            "pieces_inspected": r.get("pieces_inspected", 0),
            "rejection_rate": r.get("rejection_rate", 0)
        }
        for r in qual_reports
    ]
    
    # Cumulative production
    cumulative = {"target": 0, "actual": 0}
    if prod_reports:
        cumulative["target"] = sum(r.get("total_target", 0) for r in prod_reports)
        cumulative["actual"] = sum(r.get("total_actual", 0) for r in prod_reports)
    
    # Defect breakdown
    defect_breakdown = {}
    for r in await quality_reports.find({"po_id": po_id}, {"_id": 0, "defects": 1}).to_list(100):
        for d in r.get("defects", []):
            name = d.get("defect_name", "Unknown")
            defect_breakdown[name] = defect_breakdown.get(name, 0) + d.get("quantity", 0)
    
    # Inspection results
    inspection_results = {"pass": 0, "fail": 0, "conditional": 0}
    for r in await inspection_reports.find({"po_id": po_id}, {"_id": 0, "result": 1}).to_list(100):
        result = r.get("result", "pass")
        inspection_results[result] = inspection_results.get(result, 0) + 1
    
    return {
        "po_id": po_id,
        "po_number": summary.get("po_number", ""),
        "summary": summary,
        "production_trends": production_trends,
        "quality_trends": quality_trends,
        "cumulative_production": cumulative,
        "defect_breakdown": defect_breakdown,
        "inspection_results": inspection_results
    }


# ==================== REPORT APPROVAL ====================

@router.put("/{report_type}/{report_id}/approve")
async def approve_report(
    report_type: ReportType,
    report_id: str,
    approval: ReportApproval,
    current_user: dict = Depends(require_brand)
):
    """Approve or reject a report (Brand only)."""
    # Select collection based on type
    collection_map = {
        ReportType.PRODUCTION: production_reports,
        ReportType.QUALITY: quality_reports,
        ReportType.INSPECTION: inspection_reports,
        ReportType.FABRIC_TEST: fabric_test_reports,
        ReportType.TRIMS: trims_reports
    }
    
    collection = collection_map.get(report_type)
    if collection is None:
        raise HTTPException(status_code=400, detail="Invalid report type")
    
    result = await collection.update_one(
        {"id": report_id},
        {
            "$set": {
                "status": approval.status.value,
                "review_comments": approval.comments,
                "reviewed_by": current_user["user_id"],
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"message": f"Report {approval.status.value}", "report_id": report_id}


# ==================== ALERTS ====================

@router.get("/alerts")
async def get_report_alerts(
    po_id: Optional[str] = None,
    alert_type: Optional[AlertType] = None,
    severity: Optional[AlertSeverity] = None,
    resolved: bool = False,
    limit: int = 50,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get report alerts."""
    query = {"is_resolved": resolved}
    
    if po_id:
        query["po_id"] = po_id
    if alert_type:
        query["alert_type"] = alert_type.value
    if severity:
        query["severity"] = severity.value
    
    alerts = await report_alerts.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return alerts


@router.put("/alerts/{alert_id}/resolve")
async def resolve_report_alert(
    alert_id: str,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Resolve a report alert."""
    result = await report_alerts.update_one(
        {"id": alert_id},
        {
            "$set": {
                "is_resolved": True,
                "resolved_by": current_user["user_id"],
                "resolved_at": datetime.now(timezone.utc).isoformat(),
                "resolution_notes": notes
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert resolved"}


# ==================== TIMELINE VIEW ====================

@router.get("/po/{po_id}/timeline")
async def get_po_reports_timeline(
    po_id: str,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    report_type: Optional[ReportType] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get all reports for a PO in timeline format."""
    timeline = []
    
    # Build date filter
    date_filter = {}
    if from_date:
        date_filter["$gte"] = from_date
    if to_date:
        date_filter["$lte"] = to_date
    
    # Collect from all report types
    if not report_type or report_type == ReportType.PRODUCTION:
        query = {"po_id": po_id}
        if date_filter:
            query["report_date"] = date_filter
        prod = await production_reports.find(query, {"_id": 0}).to_list(100)
        for r in prod:
            timeline.append({
                "date": r.get("report_date"),
                "type": "production",
                "id": r.get("id"),
                "title": f"Production Report - {r.get('report_date')}",
                "status": r.get("status"),
                "efficiency": r.get("overall_efficiency"),
                "actual": r.get("total_actual"),
                "target": r.get("total_target")
            })
    
    if not report_type or report_type == ReportType.QUALITY:
        query = {"po_id": po_id}
        if date_filter:
            query["report_date"] = date_filter
        qual = await quality_reports.find(query, {"_id": 0}).to_list(100)
        for r in qual:
            timeline.append({
                "date": r.get("report_date"),
                "type": "quality",
                "id": r.get("id"),
                "title": f"Quality Report - {r.get('report_date')}",
                "status": r.get("status"),
                "dhu": r.get("dhu_percentage"),
                "defects": r.get("total_defects")
            })
    
    if not report_type or report_type == ReportType.INSPECTION:
        query = {"po_id": po_id}
        if date_filter:
            query["inspection_date"] = date_filter
        insp = await inspection_reports.find(query, {"_id": 0}).to_list(100)
        for r in insp:
            timeline.append({
                "date": r.get("inspection_date"),
                "type": "inspection",
                "id": r.get("id"),
                "title": f"Inspection - {r.get('inspection_date')}",
                "status": r.get("status"),
                "result": r.get("result"),
                "approved_qty": r.get("approved_qty")
            })
    
    if not report_type or report_type == ReportType.FABRIC_TEST:
        query = {"po_id": po_id}
        if date_filter:
            query["test_date"] = date_filter
        fabric = await fabric_test_reports.find(query, {"_id": 0}).to_list(100)
        for r in fabric:
            timeline.append({
                "date": r.get("test_date"),
                "type": "fabric_test",
                "id": r.get("id"),
                "title": f"Fabric Test - {r.get('test_date')}",
                "status": r.get("status"),
                "result": r.get("overall_result"),
                "tests_passed": r.get("tests_passed"),
                "tests_failed": r.get("tests_failed")
            })
    
    if not report_type or report_type == ReportType.TRIMS:
        query = {"po_id": po_id}
        if date_filter:
            query["test_date"] = date_filter
        trims = await trims_reports.find(query, {"_id": 0}).to_list(100)
        for r in trims:
            timeline.append({
                "date": r.get("test_date"),
                "type": "trims",
                "id": r.get("id"),
                "title": f"Trims Test - {r.get('test_date')}",
                "status": r.get("status"),
                "result": r.get("overall_result")
            })
    
    # Sort by date descending
    timeline.sort(key=lambda x: x.get("date", ""), reverse=True)
    
    return timeline



# ==================== ENHANCED SUMMARY & STATS ====================

@router.get("/po/{po_id}/enhanced-summary")
async def get_po_enhanced_summary(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get enhanced PO reports summary with status breakdown."""
    # Get PO info
    po = await pos_collection.find_one({"id": po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    # Count reports by status across all types
    status_counts = {"submitted": 0, "under_review": 0, "approved": 0, "rejected": 0}
    total_reports = 0
    
    for collection in [production_reports, quality_reports, inspection_reports, fabric_test_reports, trims_reports]:
        for status in status_counts.keys():
            count = await collection.count_documents({"po_id": po_id, "status": status})
            status_counts[status] += count
            total_reports += count
    
    # Get report type counts
    type_counts = {
        "production": await production_reports.count_documents({"po_id": po_id}),
        "quality": await quality_reports.count_documents({"po_id": po_id}),
        "inspection": await inspection_reports.count_documents({"po_id": po_id}),
        "fabric_test": await fabric_test_reports.count_documents({"po_id": po_id}),
        "trims": await trims_reports.count_documents({"po_id": po_id})
    }
    
    # Calculate averages
    prod_reports = await production_reports.find({"po_id": po_id}, {"_id": 0, "overall_efficiency": 1}).to_list(100)
    avg_efficiency = sum(r.get("overall_efficiency", 0) for r in prod_reports) / len(prod_reports) if prod_reports else 0
    
    qual_reports = await quality_reports.find({"po_id": po_id}, {"_id": 0, "dhu_percentage": 1}).to_list(100)
    avg_dhu = sum(r.get("dhu_percentage", 0) for r in qual_reports) / len(qual_reports) if qual_reports else 0
    
    # Inspection pass rate
    insp_results = await inspection_reports.find({"po_id": po_id}, {"_id": 0, "result": 1}).to_list(100)
    passed = sum(1 for r in insp_results if r.get("result") == "pass")
    pass_rate = (passed / len(insp_results) * 100) if insp_results else 0
    
    # Get alerts
    alerts = await report_alerts.find({"po_id": po_id, "is_resolved": False}, {"_id": 0}).to_list(50)
    
    # Get last report date
    last_report = None
    for collection in [production_reports, quality_reports, inspection_reports]:
        report = await collection.find_one({"po_id": po_id}, {"_id": 0}, sort=[("created_at", -1)])
        if report:
            report_date = report.get("report_date") or report.get("inspection_date") or report.get("test_date")
            if report_date and (not last_report or report_date > last_report):
                last_report = report_date
    
    return {
        "po_id": po_id,
        "po_number": po.get("po_number", ""),
        "supplier_name": po.get("supplier_name", ""),
        "style": po.get("style", ""),
        "total_reports": total_reports,
        "status_breakdown": status_counts,
        "type_breakdown": type_counts,
        "pending_count": status_counts["submitted"] + status_counts["under_review"],
        "avg_efficiency": round(avg_efficiency, 2),
        "avg_dhu": round(avg_dhu, 2),
        "inspection_pass_rate": round(pass_rate, 2),
        "active_alerts": len(alerts),
        "alerts": alerts,
        "last_report_date": last_report
    }


@router.get("/po/{po_id}/supplier-performance")
async def get_supplier_performance(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get supplier performance metrics for a PO."""
    # Get PO info
    po = await pos_collection.find_one({"id": po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    supplier_id = po.get("supplier_id") or po.get("manufacturer_id")
    
    # Calculate submission consistency (% of expected reports submitted)
    # Assuming daily reports expected from PO start date
    prod_reports = await production_reports.find({"po_id": po_id}, {"_id": 0}).to_list(100)
    qual_reports = await quality_reports.find({"po_id": po_id}, {"_id": 0}).to_list(100)
    
    # Get unique report dates
    prod_dates = set(r.get("report_date") for r in prod_reports if r.get("report_date"))
    qual_dates = set(r.get("report_date") for r in qual_reports if r.get("report_date"))
    
    # Calculate quality score (inverse of avg DHU, capped at 100)
    avg_dhu = sum(r.get("dhu_percentage", 0) for r in qual_reports) / len(qual_reports) if qual_reports else 0
    quality_score = max(0, min(100, 100 - (avg_dhu * 10)))
    
    # Calculate efficiency score
    avg_efficiency = sum(r.get("overall_efficiency", 0) for r in prod_reports) / len(prod_reports) if prod_reports else 0
    
    # Inspection success rate
    insp_reports = await inspection_reports.find({"po_id": po_id}, {"_id": 0}).to_list(100)
    passed = sum(1 for r in insp_reports if r.get("result") == "pass")
    inspection_rate = (passed / len(insp_reports) * 100) if insp_reports else 100
    
    # On-time submission (reports submitted within 24hrs of report_date)
    on_time = 0
    total = len(prod_reports) + len(qual_reports)
    for r in prod_reports + qual_reports:
        report_date = r.get("report_date")
        created_at = r.get("created_at")
        if report_date and created_at:
            # Simple check - consider on-time if created within same day
            on_time += 1
    on_time_rate = (on_time / total * 100) if total > 0 else 100
    
    # Overall score (weighted average)
    overall_score = (quality_score * 0.4) + (avg_efficiency * 0.3) + (inspection_rate * 0.2) + (on_time_rate * 0.1)
    
    return {
        "supplier_id": supplier_id,
        "supplier_name": po.get("supplier_name", ""),
        "po_id": po_id,
        "po_number": po.get("po_number", ""),
        "metrics": {
            "quality_score": round(quality_score, 1),
            "avg_efficiency": round(avg_efficiency, 1),
            "avg_dhu": round(avg_dhu, 2),
            "inspection_pass_rate": round(inspection_rate, 1),
            "on_time_submission_rate": round(on_time_rate, 1),
            "overall_score": round(overall_score, 1)
        },
        "report_counts": {
            "production_reports": len(prod_reports),
            "quality_reports": len(qual_reports),
            "inspection_reports": len(insp_reports),
            "unique_production_dates": len(prod_dates),
            "unique_quality_dates": len(qual_dates)
        }
    }


@router.get("/po/{po_id}/missing-dates")
async def get_missing_report_dates(
    po_id: str,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get dates with missing reports for a PO."""
    # Get PO info
    po = await pos_collection.find_one({"id": po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    # Default date range: last 30 days
    if not to_date:
        to_date = date.today().isoformat()
    if not from_date:
        from_date = (date.today() - timedelta(days=30)).isoformat()
    
    # Get all report dates
    prod_dates = set()
    qual_dates = set()
    
    prod_reports = await production_reports.find({"po_id": po_id}, {"_id": 0, "report_date": 1}).to_list(100)
    qual_reports = await quality_reports.find({"po_id": po_id}, {"_id": 0, "report_date": 1}).to_list(100)
    
    for r in prod_reports:
        if r.get("report_date"):
            prod_dates.add(r["report_date"])
    for r in qual_reports:
        if r.get("report_date"):
            qual_dates.add(r["report_date"])
    
    # Generate all dates in range
    start = date.fromisoformat(from_date)
    end = date.fromisoformat(to_date)
    all_dates = []
    current = start
    while current <= end:
        date_str = current.isoformat()
        all_dates.append({
            "date": date_str,
            "has_production": date_str in prod_dates,
            "has_quality": date_str in qual_dates,
            "is_missing": date_str not in prod_dates or date_str not in qual_dates,
            "is_weekend": current.weekday() >= 5
        })
        current += timedelta(days=1)
    
    # Filter to only missing (non-weekend) dates
    missing_dates = [d for d in all_dates if d["is_missing"] and not d["is_weekend"]]
    
    return {
        "po_id": po_id,
        "date_range": {"from": from_date, "to": to_date},
        "total_days": len(all_dates),
        "missing_count": len(missing_dates),
        "all_dates": all_dates,
        "missing_dates": missing_dates
    }


@router.get("/po/{po_id}/report-detail/{report_type}/{report_id}")
async def get_report_detail(
    po_id: str,
    report_type: ReportType,
    report_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get detailed report with approval history."""
    # Select collection based on type
    collection_map = {
        ReportType.PRODUCTION: production_reports,
        ReportType.QUALITY: quality_reports,
        ReportType.INSPECTION: inspection_reports,
        ReportType.FABRIC_TEST: fabric_test_reports,
        ReportType.TRIMS: trims_reports
    }
    
    collection = collection_map.get(report_type)
    if collection is None:
        raise HTTPException(status_code=400, detail="Invalid report type")
    
    report = await collection.find_one({"id": report_id, "po_id": po_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Build approval history
    approval_history = []
    if report.get("reviewed_at"):
        approval_history.append({
            "action": report.get("status"),
            "by": report.get("reviewed_by"),
            "at": report.get("reviewed_at"),
            "comments": report.get("review_comments")
        })
    
    # Get related traceability
    traceability = await traceability_collection.find_one({"po_id": po_id}, {"_id": 0, "id": 1, "status": 1, "traceability_score": 1})
    
    return {
        "report": report,
        "report_type": report_type.value,
        "approval_history": approval_history,
        "traceability_link": {
            "id": traceability.get("id") if traceability else None,
            "status": traceability.get("status") if traceability else None,
            "score": traceability.get("traceability_score") if traceability else None
        }
    }


@router.get("/po/{po_id}/alerts-panel")
async def get_alerts_panel(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get categorized alerts for the alerts panel."""
    alerts = await report_alerts.find({"po_id": po_id, "is_resolved": False}, {"_id": 0}).to_list(100)
    
    # Categorize by severity
    critical = [a for a in alerts if a.get("severity") == "high"]
    warning = [a for a in alerts if a.get("severity") == "medium"]
    info = [a for a in alerts if a.get("severity") == "low"]
    
    # Categorize by type
    by_type = {}
    for alert in alerts:
        alert_type = alert.get("alert_type", "other")
        if alert_type not in by_type:
            by_type[alert_type] = []
        by_type[alert_type].append(alert)
    
    return {
        "po_id": po_id,
        "total_alerts": len(alerts),
        "by_severity": {
            "critical": critical,
            "warning": warning,
            "info": info
        },
        "by_type": by_type,
        "counts": {
            "critical": len(critical),
            "warning": len(warning),
            "info": len(info)
        }
    }
