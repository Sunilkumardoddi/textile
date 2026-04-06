"""
PO Reports Management Module Tests
Tests for DPR (Daily Production Reports), DQR (Daily Quality Reports), 
Final Inspection Reports, Fabric Test Reports, Trims Reports, 
Analytics, Alerts, and Approval Workflow
"""
import pytest
import requests
import os
import json
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
BRAND_CREDENTIALS = {"email": "brand@textile.com", "password": "testpassword"}
MANUFACTURER_CREDENTIALS = {"email": "manufacturer@textile.com", "password": "testpassword"}

# Test PO ID from seed data
TEST_PO_ID = "61bc85e4-8d3c-4d1f-a533-b7c5cfda5bee"
TEST_MANUFACTURER_ID = "3fe2141b-98f2-4cfe-9c1a-e2e9ccdfaec3"


@pytest.fixture(scope="module")
def brand_token():
    """Get brand user auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_CREDENTIALS)
    assert response.status_code == 200, f"Brand login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def manufacturer_token():
    """Get manufacturer user auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=MANUFACTURER_CREDENTIALS)
    assert response.status_code == 200, f"Manufacturer login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def brand_headers(brand_token):
    """Headers with brand auth token"""
    return {"Authorization": f"Bearer {brand_token}"}


@pytest.fixture(scope="module")
def manufacturer_headers(manufacturer_token):
    """Headers with manufacturer auth token"""
    return {"Authorization": f"Bearer {manufacturer_token}"}


class TestPOReportsSummary:
    """Test PO Reports Summary endpoint"""
    
    def test_get_po_summary(self, brand_headers):
        """GET /api/reports/po/{po_id} returns summary stats"""
        response = requests.get(
            f"{BASE_URL}/api/reports/po/{TEST_PO_ID}",
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify summary structure
        assert "po_id" in data
        assert data["po_id"] == TEST_PO_ID
        assert "total_production_reports" in data
        assert "total_quality_reports" in data
        assert "total_inspection_reports" in data
        assert "total_fabric_test_reports" in data
        assert "total_trims_reports" in data
        assert "avg_efficiency" in data
        assert "avg_dhu" in data
        assert "inspection_pass_rate" in data
        assert "pending_approvals" in data
        assert "active_alerts" in data
        print(f"PO Summary: {data['total_production_reports']} production, {data['total_quality_reports']} quality, {data['total_inspection_reports']} inspection reports")


class TestPOReportsAnalytics:
    """Test PO Reports Analytics endpoint"""
    
    def test_get_po_analytics(self, brand_headers):
        """GET /api/reports/po/{po_id}/analytics returns charts data"""
        response = requests.get(
            f"{BASE_URL}/api/reports/po/{TEST_PO_ID}/analytics",
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify analytics structure
        assert "po_id" in data
        assert "summary" in data
        assert "production_trends" in data
        assert "quality_trends" in data
        assert "cumulative_production" in data
        assert "defect_breakdown" in data
        assert "inspection_results" in data
        
        # Verify production trends structure
        if data["production_trends"]:
            trend = data["production_trends"][0]
            assert "date" in trend
            assert "target" in trend
            assert "actual" in trend
            assert "efficiency" in trend
            print(f"Production trend sample: {trend}")
        
        # Verify quality trends structure
        if data["quality_trends"]:
            trend = data["quality_trends"][0]
            assert "date" in trend
            assert "dhu_percentage" in trend
            assert "defect_count" in trend
            print(f"Quality trend sample: {trend}")
        
        print(f"Analytics: {len(data['production_trends'])} production trends, {len(data['quality_trends'])} quality trends")


class TestProductionReports:
    """Test Production Reports (DPR) CRUD"""
    
    def test_create_production_report(self, manufacturer_headers):
        """POST /api/reports/production creates DPR"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        form_data = {
            "po_id": TEST_PO_ID,
            "po_number": "PO-2024-001",
            "supplier_id": TEST_MANUFACTURER_ID,
            "supplier_name": "Test Manufacturer",
            "report_date": today,
            "style": "TEST_Style_001",
            "lines_data": json.dumps([
                {"line_number": "L1", "target_qty": 500, "actual_qty": 480, "wip_qty": 20, "efficiency_percentage": 96.0}
            ]),
            "total_target": 500,
            "total_actual": 480,
            "total_wip": 20,
            "overall_efficiency": 96.0,
            "remarks": "TEST_Production report for testing"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reports/production",
            data=form_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "report_id" in data
        assert "message" in data
        print(f"Created production report: {data['report_id']}")
        return data["report_id"]
    
    def test_get_production_reports(self, brand_headers):
        """GET /api/reports/production returns list"""
        response = requests.get(
            f"{BASE_URL}/api/reports/production",
            params={"po_id": TEST_PO_ID},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            report = data[0]
            assert "id" in report
            assert "report_date" in report
            assert "total_target" in report
            assert "total_actual" in report
            assert "overall_efficiency" in report
            assert "status" in report
            print(f"Found {len(data)} production reports, first: {report['report_date']} - {report['overall_efficiency']}% efficiency")
    
    def test_get_production_report_by_id(self, brand_headers):
        """GET /api/reports/production/{report_id} returns single report"""
        # First get list to get an ID
        list_response = requests.get(
            f"{BASE_URL}/api/reports/production",
            params={"po_id": TEST_PO_ID},
            headers=brand_headers
        )
        if list_response.status_code == 200 and list_response.json():
            report_id = list_response.json()[0]["id"]
            
            response = requests.get(
                f"{BASE_URL}/api/reports/production/{report_id}",
                headers=brand_headers
            )
            assert response.status_code == 200, f"Failed: {response.text}"
            data = response.json()
            assert data["id"] == report_id
            print(f"Retrieved production report: {data['id']}")


class TestQualityReports:
    """Test Quality Reports (DQR) CRUD"""
    
    def test_create_quality_report(self, manufacturer_headers):
        """POST /api/reports/quality creates DQR with defect tracking"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        form_data = {
            "po_id": TEST_PO_ID,
            "po_number": "PO-2024-001",
            "supplier_id": TEST_MANUFACTURER_ID,
            "supplier_name": "Test Manufacturer",
            "report_date": today,
            "style": "TEST_Style_001",
            "inspection_type": "inline",
            "pieces_inspected": 200,
            "pieces_passed": 190,
            "pieces_rejected": 10,
            "defects_data": json.dumps([
                {"defect_name": "Stain", "severity": "minor", "quantity": 5},
                {"defect_name": "Broken Stitch", "severity": "major", "quantity": 3},
                {"defect_name": "Hole", "severity": "critical", "quantity": 2}
            ]),
            "dhu_percentage": 5.0,
            "remarks": "TEST_Quality report for testing"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reports/quality",
            data=form_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "report_id" in data
        print(f"Created quality report: {data['report_id']}")
        return data["report_id"]
    
    def test_get_quality_reports(self, brand_headers):
        """GET /api/reports/quality returns list"""
        response = requests.get(
            f"{BASE_URL}/api/reports/quality",
            params={"po_id": TEST_PO_ID},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            report = data[0]
            assert "id" in report
            assert "dhu_percentage" in report
            assert "pieces_inspected" in report
            assert "total_defects" in report
            print(f"Found {len(data)} quality reports, first: {report['report_date']} - {report['dhu_percentage']}% DHU")
    
    def test_high_dhu_creates_alert(self, manufacturer_headers, brand_headers):
        """Quality report with DHU > 5% should create alert"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Create report with high DHU
        form_data = {
            "po_id": TEST_PO_ID,
            "po_number": "PO-2024-001",
            "supplier_id": TEST_MANUFACTURER_ID,
            "supplier_name": "Test Manufacturer",
            "report_date": today,
            "pieces_inspected": 100,
            "pieces_passed": 85,
            "pieces_rejected": 15,
            "defects_data": json.dumps([
                {"defect_name": "TEST_High_DHU_Defect", "severity": "major", "quantity": 8}
            ]),
            "dhu_percentage": 8.0,  # Above 5% threshold
            "remarks": "TEST_High DHU report"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reports/quality",
            data=form_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 200
        
        # Check alerts
        alerts_response = requests.get(
            f"{BASE_URL}/api/reports/alerts",
            params={"po_id": TEST_PO_ID, "resolved": False},
            headers=brand_headers
        )
        assert alerts_response.status_code == 200
        alerts = alerts_response.json()
        
        # Should have at least one high DHU alert
        high_dhu_alerts = [a for a in alerts if "DHU" in a.get("title", "")]
        print(f"Found {len(high_dhu_alerts)} high DHU alerts")


class TestInspectionReports:
    """Test Final Inspection Reports CRUD"""
    
    def test_create_inspection_report(self, manufacturer_headers):
        """POST /api/reports/inspection creates inspection report"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        form_data = {
            "po_id": TEST_PO_ID,
            "po_number": "PO-2024-001",
            "supplier_id": TEST_MANUFACTURER_ID,
            "supplier_name": "Test Manufacturer",
            "inspection_date": today,
            "style": "TEST_Style_001",
            "inspector_name": "John Inspector",
            "inspector_company": "QC Services Ltd",
            "lot_size": 1000,
            "sample_size": 80,
            "aql_level": "2.5",
            "result": "pass",
            "approved_qty": 980,
            "rejected_qty": 20,
            "findings_data": json.dumps([
                {"category": "workmanship", "description": "Minor stitching issue", "severity": "minor", "quantity": 5}
            ]),
            "comments": "TEST_Inspection passed with minor findings"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reports/inspection",
            data=form_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "report_id" in data
        print(f"Created inspection report: {data['report_id']}")
        return data["report_id"]
    
    def test_get_inspection_reports(self, brand_headers):
        """GET /api/reports/inspection returns list"""
        response = requests.get(
            f"{BASE_URL}/api/reports/inspection",
            params={"po_id": TEST_PO_ID},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            report = data[0]
            assert "id" in report
            assert "result" in report
            assert "lot_size" in report
            assert "sample_size" in report
            assert "approved_qty" in report
            print(f"Found {len(data)} inspection reports, first: {report['inspection_date']} - {report['result']}")
    
    def test_failed_inspection_creates_alert(self, manufacturer_headers, brand_headers):
        """Failed inspection should create alert"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        form_data = {
            "po_id": TEST_PO_ID,
            "po_number": "PO-2024-001",
            "supplier_id": TEST_MANUFACTURER_ID,
            "supplier_name": "Test Manufacturer",
            "inspection_date": today,
            "lot_size": 500,
            "sample_size": 50,
            "aql_level": "2.5",
            "result": "fail",  # Failed inspection
            "approved_qty": 200,
            "rejected_qty": 300,
            "findings_data": json.dumps([
                {"category": "workmanship", "description": "TEST_Major defects found", "severity": "critical", "quantity": 25}
            ]),
            "comments": "TEST_Inspection failed"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reports/inspection",
            data=form_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 200
        
        # Check alerts
        alerts_response = requests.get(
            f"{BASE_URL}/api/reports/alerts",
            params={"po_id": TEST_PO_ID, "resolved": False},
            headers=brand_headers
        )
        assert alerts_response.status_code == 200
        alerts = alerts_response.json()
        
        # Should have failed inspection alert
        failed_alerts = [a for a in alerts if "Failed" in a.get("title", "") or "Inspection" in a.get("title", "")]
        print(f"Found {len(failed_alerts)} inspection-related alerts")


class TestFabricTestReports:
    """Test Fabric Test Reports CRUD"""
    
    def test_create_fabric_test_report(self, manufacturer_headers):
        """POST /api/reports/fabric-tests creates fabric test report"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        form_data = {
            "po_id": TEST_PO_ID,
            "po_number": "PO-2024-001",
            "supplier_id": TEST_MANUFACTURER_ID,
            "supplier_name": "Test Manufacturer",
            "test_date": today,
            "style": "TEST_Style_001",
            "fabric_type": "Cotton Jersey",
            "lab_name": "SGS Testing Lab",
            "lab_report_number": "SGS-2024-001",
            "tests_data": json.dumps([
                {"test_name": "GSM", "specification": "180-200", "actual_result": "190", "status": "pass"},
                {"test_name": "Shrinkage", "specification": "<5%", "actual_result": "3%", "status": "pass"},
                {"test_name": "Color Fastness", "specification": "Grade 4+", "actual_result": "Grade 4.5", "status": "pass"}
            ]),
            "overall_result": "pass",
            "comments": "TEST_All fabric tests passed"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reports/fabric-tests",
            data=form_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "report_id" in data
        print(f"Created fabric test report: {data['report_id']}")
    
    def test_get_fabric_test_reports(self, brand_headers):
        """GET /api/reports/fabric-tests returns list"""
        response = requests.get(
            f"{BASE_URL}/api/reports/fabric-tests",
            params={"po_id": TEST_PO_ID},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            report = data[0]
            assert "id" in report
            assert "overall_result" in report
            assert "tests_passed" in report
            assert "tests_failed" in report
            print(f"Found {len(data)} fabric test reports")


class TestTrimsReports:
    """Test Trims & Accessories Reports CRUD"""
    
    def test_create_trims_report(self, manufacturer_headers):
        """POST /api/reports/trims creates trims report"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        form_data = {
            "po_id": TEST_PO_ID,
            "po_number": "PO-2024-001",
            "supplier_id": TEST_MANUFACTURER_ID,
            "supplier_name": "Test Manufacturer",
            "test_date": today,
            "style": "TEST_Style_001",
            "items_data": json.dumps([
                {"item_name": "Button", "test_name": "Pull Strength", "specification": ">15N", "actual_result": "18N", "status": "pass"},
                {"item_name": "Zipper", "test_name": "Cycle Test", "specification": ">500 cycles", "actual_result": "650 cycles", "status": "pass"}
            ]),
            "overall_result": "pass",
            "comments": "TEST_All trims tests passed"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reports/trims",
            data=form_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "report_id" in data
        print(f"Created trims report: {data['report_id']}")
    
    def test_get_trims_reports(self, brand_headers):
        """GET /api/reports/trims returns list"""
        response = requests.get(
            f"{BASE_URL}/api/reports/trims",
            params={"po_id": TEST_PO_ID},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            report = data[0]
            assert "id" in report
            assert "overall_result" in report
            print(f"Found {len(data)} trims reports")


class TestReportApproval:
    """Test Report Approval Workflow"""
    
    def test_approve_production_report(self, brand_headers):
        """PUT /api/reports/production/{report_id}/approve approves report"""
        # First get a submitted report
        list_response = requests.get(
            f"{BASE_URL}/api/reports/production",
            params={"po_id": TEST_PO_ID, "status": "submitted"},
            headers=brand_headers
        )
        
        if list_response.status_code == 200 and list_response.json():
            report_id = list_response.json()[0]["id"]
            
            response = requests.put(
                f"{BASE_URL}/api/reports/production/{report_id}/approve",
                json={"status": "approved", "comments": "TEST_Approved by brand"},
                headers=brand_headers
            )
            assert response.status_code == 200, f"Failed: {response.text}"
            data = response.json()
            assert "message" in data
            print(f"Approved production report: {report_id}")
        else:
            print("No submitted production reports to approve")
    
    def test_reject_quality_report(self, brand_headers):
        """PUT /api/reports/quality/{report_id}/approve can reject report"""
        # First get a submitted report
        list_response = requests.get(
            f"{BASE_URL}/api/reports/quality",
            params={"po_id": TEST_PO_ID, "status": "submitted"},
            headers=brand_headers
        )
        
        if list_response.status_code == 200 and list_response.json():
            report_id = list_response.json()[0]["id"]
            
            response = requests.put(
                f"{BASE_URL}/api/reports/quality/{report_id}/approve",
                json={"status": "rejected", "comments": "TEST_Rejected - needs more details"},
                headers=brand_headers
            )
            assert response.status_code == 200, f"Failed: {response.text}"
            print(f"Rejected quality report: {report_id}")
        else:
            print("No submitted quality reports to reject")


class TestReportAlerts:
    """Test Report Alerts"""
    
    def test_get_alerts(self, brand_headers):
        """GET /api/reports/alerts returns alerts list"""
        response = requests.get(
            f"{BASE_URL}/api/reports/alerts",
            params={"po_id": TEST_PO_ID, "resolved": False},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            alert = data[0]
            assert "id" in alert
            assert "alert_type" in alert
            assert "severity" in alert
            assert "title" in alert
            assert "is_resolved" in alert
            print(f"Found {len(data)} active alerts")
    
    def test_resolve_alert(self, brand_headers):
        """PUT /api/reports/alerts/{alert_id}/resolve resolves alert"""
        # First get an unresolved alert
        list_response = requests.get(
            f"{BASE_URL}/api/reports/alerts",
            params={"po_id": TEST_PO_ID, "resolved": False},
            headers=brand_headers
        )
        
        if list_response.status_code == 200 and list_response.json():
            alert_id = list_response.json()[0]["id"]
            
            response = requests.put(
                f"{BASE_URL}/api/reports/alerts/{alert_id}/resolve",
                params={"notes": "TEST_Resolved during testing"},
                headers=brand_headers
            )
            assert response.status_code == 200, f"Failed: {response.text}"
            print(f"Resolved alert: {alert_id}")
        else:
            print("No unresolved alerts to resolve")


class TestPOTimeline:
    """Test PO Reports Timeline"""
    
    def test_get_timeline(self, brand_headers):
        """GET /api/reports/po/{po_id}/timeline returns chronological reports"""
        response = requests.get(
            f"{BASE_URL}/api/reports/po/{TEST_PO_ID}/timeline",
            headers=brand_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            item = data[0]
            assert "date" in item
            assert "type" in item
            assert "id" in item
            assert "title" in item
            assert "status" in item
            print(f"Timeline has {len(data)} items")
            
            # Verify types
            types = set(i["type"] for i in data)
            print(f"Report types in timeline: {types}")


class TestRoleBasedAccess:
    """Test role-based access control"""
    
    def test_manufacturer_cannot_approve(self, manufacturer_headers, brand_headers):
        """Manufacturer should not be able to approve reports"""
        # Get a report ID
        list_response = requests.get(
            f"{BASE_URL}/api/reports/production",
            params={"po_id": TEST_PO_ID},
            headers=brand_headers
        )
        
        if list_response.status_code == 200 and list_response.json():
            report_id = list_response.json()[0]["id"]
            
            # Try to approve as manufacturer
            response = requests.put(
                f"{BASE_URL}/api/reports/production/{report_id}/approve",
                json={"status": "approved", "comments": "TEST_Should fail"},
                headers=manufacturer_headers
            )
            # Should be forbidden (403) or unauthorized
            assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
            print("Manufacturer correctly blocked from approving reports")
    
    def test_brand_can_view_all_reports(self, brand_headers):
        """Brand should be able to view all reports"""
        endpoints = [
            f"/api/reports/production?po_id={TEST_PO_ID}",
            f"/api/reports/quality?po_id={TEST_PO_ID}",
            f"/api/reports/inspection?po_id={TEST_PO_ID}",
            f"/api/reports/fabric-tests?po_id={TEST_PO_ID}",
            f"/api/reports/trims?po_id={TEST_PO_ID}",
        ]
        
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=brand_headers)
            assert response.status_code == 200, f"Brand failed to access {endpoint}: {response.text}"
        
        print("Brand can access all report endpoints")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
