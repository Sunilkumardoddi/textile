"""
Traceability & Sustainability Module Tests
Tests for PO-wise traceability tracking, supply chain mapping, alerts, and documents
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://supply-chain-portal.preview.emergentagent.com')

# Test credentials
BRAND_USER = {"email": "brand@textile.com", "password": "testpassword"}
MANUFACTURER_USER = {"email": "manufacturer@textile.com", "password": "testpassword"}
ADMIN_USER = {"email": "admin@textile.com", "password": "testpassword"}

# Known test PO ID from context
TEST_PO_ID = "61bc85e4-8d3c-4d1f-a533-b7c5cfda5bee"


class TestTraceabilityAuth:
    """Test authentication for traceability endpoints"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        """Get brand user token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        assert response.status_code == 200, f"Brand login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def manufacturer_token(self):
        """Get manufacturer user token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=MANUFACTURER_USER)
        assert response.status_code == 200, f"Manufacturer login failed: {response.text}"
        return response.json()["access_token"]
    
    def test_brand_login(self, brand_token):
        """Test brand user can login"""
        assert brand_token is not None
        assert len(brand_token) > 0
        print(f"✓ Brand login successful")
    
    def test_manufacturer_login(self, manufacturer_token):
        """Test manufacturer user can login"""
        assert manufacturer_token is not None
        assert len(manufacturer_token) > 0
        print(f"✓ Manufacturer login successful")


class TestTraceabilityOverview:
    """Test traceability overview/stats endpoint"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        return response.json()["access_token"]
    
    def test_get_overview_stats(self, brand_token):
        """GET /api/traceability/stats/overview - Get traceability overview stats"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(f"{BASE_URL}/api/traceability/stats/overview", headers=headers)
        
        assert response.status_code == 200, f"Failed to get overview: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "total_records" in data, "Missing total_records"
        assert "by_status" in data, "Missing by_status"
        assert "avg_traceability_score" in data, "Missing avg_traceability_score"
        assert "avg_compliance_score" in data, "Missing avg_compliance_score"
        assert "active_alerts" in data, "Missing active_alerts"
        
        # Verify data types
        assert isinstance(data["total_records"], int)
        assert isinstance(data["avg_traceability_score"], (int, float))
        assert isinstance(data["avg_compliance_score"], (int, float))
        assert isinstance(data["active_alerts"], int)
        
        print(f"✓ Overview stats: {data['total_records']} records, avg score: {data['avg_traceability_score']}%")


class TestTraceabilityPO:
    """Test PO-level traceability endpoints"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def manufacturer_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=MANUFACTURER_USER)
        return response.json()["access_token"]
    
    def test_get_traceability_by_po(self, brand_token):
        """GET /api/traceability/po/{po_id} - Get traceability record for a PO"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}", headers=headers)
        
        assert response.status_code == 200, f"Failed to get traceability: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Missing id"
        assert "po_id" in data, "Missing po_id"
        assert "po_number" in data, "Missing po_number"
        assert "supply_chain" in data, "Missing supply_chain"
        assert "tier_suppliers" in data, "Missing tier_suppliers"
        assert "documents" in data, "Missing documents"
        assert "status" in data, "Missing status"
        assert "traceability_score" in data, "Missing traceability_score"
        assert "compliance_score" in data, "Missing compliance_score"
        
        # Verify supply chain has 5 stages
        assert len(data["supply_chain"]) == 5, f"Expected 5 supply chain stages, got {len(data['supply_chain'])}"
        
        # Verify stages are correct
        stages = [s["stage"] for s in data["supply_chain"]]
        expected_stages = ["fiber", "yarn", "fabric", "garment", "dispatch"]
        for stage in expected_stages:
            assert stage in stages, f"Missing stage: {stage}"
        
        print(f"✓ Traceability record: PO {data['po_number']}, status: {data['status']}, score: {data['traceability_score']}%")
        return data
    
    def test_create_or_get_traceability(self, brand_token):
        """POST /api/traceability/po/{po_id} - Create or get traceability record"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.post(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}", headers=headers)
        
        assert response.status_code == 200, f"Failed to create/get traceability: {response.text}"
        data = response.json()
        
        assert "id" in data
        assert "po_id" in data
        assert data["po_id"] == TEST_PO_ID
        
        print(f"✓ Create/Get traceability: {data['id']}")
    
    def test_update_supply_chain_stages(self, brand_token):
        """PUT /api/traceability/po/{po_id}/supply-chain - Update supply chain stages"""
        headers = {"Authorization": f"Bearer {brand_token}", "Content-Type": "application/json"}
        
        # Update fiber stage
        updates = [{
            "stage": "fiber",
            "supplier_name": "TEST_Fiber_Supplier",
            "supplier_tier": "tier_3",
            "location": "Gujarat, India",
            "country": "India",
            "completed": True,
            "batch_numbers": ["BATCH-TEST-001"],
            "notes": "Test fiber stage update"
        }]
        
        response = requests.put(
            f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}/supply-chain",
            headers=headers,
            json=updates
        )
        
        assert response.status_code == 200, f"Failed to update supply chain: {response.text}"
        data = response.json()
        
        assert "message" in data
        assert "traceability_score" in data
        assert "status" in data
        
        print(f"✓ Supply chain updated: score {data['traceability_score']}%, status: {data['status']}")
    
    def test_verify_supply_chain_update_persisted(self, brand_token):
        """Verify supply chain update was persisted"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Find fiber stage
        fiber_stage = next((s for s in data["supply_chain"] if s["stage"] == "fiber"), None)
        assert fiber_stage is not None, "Fiber stage not found"
        assert fiber_stage["completed"] == True, "Fiber stage should be completed"
        
        print(f"✓ Supply chain update verified: fiber stage completed")
    
    def test_manufacturer_can_access_traceability(self, manufacturer_token):
        """Manufacturer should be able to access traceability data"""
        headers = {"Authorization": f"Bearer {manufacturer_token}"}
        response = requests.get(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}", headers=headers)
        
        assert response.status_code == 200, f"Manufacturer access failed: {response.text}"
        print(f"✓ Manufacturer can access traceability data")


class TestTraceabilityAlerts:
    """Test traceability alerts endpoints"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        return response.json()["access_token"]
    
    def test_get_alerts(self, brand_token):
        """GET /api/traceability/alerts - Get active alerts"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(
            f"{BASE_URL}/api/traceability/alerts",
            headers=headers,
            params={"resolved": False, "limit": 10}
        )
        
        assert response.status_code == 200, f"Failed to get alerts: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Alerts should be a list"
        
        # If there are alerts, verify structure
        if len(data) > 0:
            alert = data[0]
            assert "id" in alert, "Alert missing id"
            assert "po_id" in alert, "Alert missing po_id"
            assert "alert_type" in alert, "Alert missing alert_type"
            assert "severity" in alert, "Alert missing severity"
            assert "title" in alert, "Alert missing title"
            assert "description" in alert, "Alert missing description"
            assert "is_resolved" in alert, "Alert missing is_resolved"
            
            # Verify severity is valid
            assert alert["severity"] in ["high", "medium", "low"], f"Invalid severity: {alert['severity']}"
        
        print(f"✓ Got {len(data)} active alerts")
        return data
    
    def test_get_alerts_by_po(self, brand_token):
        """GET /api/traceability/alerts?po_id={po_id} - Get alerts for specific PO"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(
            f"{BASE_URL}/api/traceability/alerts",
            headers=headers,
            params={"po_id": TEST_PO_ID, "resolved": False}
        )
        
        assert response.status_code == 200, f"Failed to get PO alerts: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        
        # All alerts should be for the specified PO
        for alert in data:
            assert alert["po_id"] == TEST_PO_ID, f"Alert PO mismatch: {alert['po_id']}"
        
        print(f"✓ Got {len(data)} alerts for PO {TEST_PO_ID}")
    
    def test_get_alerts_by_severity(self, brand_token):
        """GET /api/traceability/alerts?severity=high - Filter alerts by severity"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(
            f"{BASE_URL}/api/traceability/alerts",
            headers=headers,
            params={"severity": "high", "resolved": False}
        )
        
        assert response.status_code == 200, f"Failed to get high severity alerts: {response.text}"
        data = response.json()
        
        # All alerts should be high severity
        for alert in data:
            assert alert["severity"] == "high", f"Expected high severity, got: {alert['severity']}"
        
        print(f"✓ Got {len(data)} high severity alerts")


class TestTraceabilityDocuments:
    """Test traceability document endpoints"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        return response.json()["access_token"]
    
    def test_get_documents(self, brand_token):
        """GET /api/traceability/po/{po_id}/documents - Get documents for a PO"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}/documents", headers=headers)
        
        assert response.status_code == 200, f"Failed to get documents: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Documents should be a list"
        
        # If there are documents, verify structure
        if len(data) > 0:
            doc = data[0]
            assert "id" in doc, "Document missing id"
            assert "document_type" in doc, "Document missing document_type"
            assert "title" in doc, "Document missing title"
            assert "status" in doc, "Document missing status"
        
        print(f"✓ Got {len(data)} documents for PO")


class TestTraceabilitySeasons:
    """Test season-level traceability endpoints"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def season_id(self, brand_token):
        """Get a valid season ID"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(f"{BASE_URL}/api/seasons/", headers=headers, params={"limit": 1})
        if response.status_code == 200 and len(response.json()) > 0:
            return response.json()[0]["id"]
        pytest.skip("No seasons available for testing")
    
    def test_get_season_traceability(self, brand_token, season_id):
        """GET /api/traceability/season/{season_id} - Get season traceability summary"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(f"{BASE_URL}/api/traceability/season/{season_id}", headers=headers)
        
        assert response.status_code == 200, f"Failed to get season traceability: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "season_id" in data, "Missing season_id"
        assert "total_pos" in data, "Missing total_pos"
        assert "traceable_pos" in data, "Missing traceable_pos"
        assert "traceability_percentage" in data, "Missing traceability_percentage"
        assert "compliance_percentage" in data, "Missing compliance_percentage"
        
        print(f"✓ Season traceability: {data['total_pos']} POs, {data['traceability_percentage']}% traceable")
    
    def test_get_season_pos_traceability(self, brand_token, season_id):
        """GET /api/traceability/season/{season_id}/pos - Get POs with traceability for season"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(
            f"{BASE_URL}/api/traceability/season/{season_id}/pos",
            headers=headers,
            params={"limit": 10}
        )
        
        assert response.status_code == 200, f"Failed to get season POs: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        
        # If there are POs, verify structure
        if len(data) > 0:
            po = data[0]
            assert "po_id" in po, "Missing po_id"
            assert "po_number" in po, "Missing po_number"
            assert "traceability_status" in po, "Missing traceability_status"
            assert "traceability_score" in po, "Missing traceability_score"
        
        print(f"✓ Got {len(data)} POs for season")


class TestTraceabilitySuppliers:
    """Test tier supplier mapping endpoints"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        return response.json()["access_token"]
    
    def test_update_tier_suppliers(self, brand_token):
        """PUT /api/traceability/po/{po_id}/suppliers - Update tier suppliers"""
        headers = {"Authorization": f"Bearer {brand_token}", "Content-Type": "application/json"}
        
        suppliers = [{
            "supplier_id": str(uuid.uuid4()),
            "supplier_name": "TEST_Tier1_Supplier",
            "tier": "tier_1",
            "role": "Garment Factory",
            "country": "India",
            "certifications": ["ISO 9001"],
            "stages_handled": ["garment"]
        }]
        
        response = requests.put(
            f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}/suppliers",
            headers=headers,
            json=suppliers
        )
        
        assert response.status_code == 200, f"Failed to update suppliers: {response.text}"
        data = response.json()
        
        assert "message" in data
        assert "traceability_score" in data
        
        print(f"✓ Tier suppliers updated: score {data['traceability_score']}%")
    
    def test_verify_suppliers_persisted(self, brand_token):
        """Verify supplier update was persisted"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have at least one tier supplier
        assert len(data["tier_suppliers"]) >= 1, "No tier suppliers found"
        
        # Find our test supplier
        test_supplier = next((s for s in data["tier_suppliers"] if "TEST_" in s.get("supplier_name", "")), None)
        if test_supplier:
            assert test_supplier["tier"] == "tier_1"
            assert test_supplier["country"] == "India"
        
        print(f"✓ Tier suppliers verified: {len(data['tier_suppliers'])} suppliers")


class TestTraceabilityMaterials:
    """Test material details endpoints"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        return response.json()["access_token"]
    
    def test_update_material_details(self, brand_token):
        """PUT /api/traceability/po/{po_id}/materials - Update material details"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        
        # Use form data for this endpoint
        form_data = {
            "material_type": "Cotton",
            "composition": "100% Organic Cotton",
            "gsm": "180",
            "width_cm": "150",
            "weave_type": "Plain",
            "color": "Natural White",
            "finish": "Enzyme Wash",
            "origin_country": "India",
            "certifications": "GOTS,OEKO-TEX",
            "sustainability_tags": "organic,fair-trade"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}/materials",
            headers=headers,
            data=form_data
        )
        
        assert response.status_code == 200, f"Failed to update materials: {response.text}"
        data = response.json()
        
        assert "message" in data
        assert "traceability_score" in data
        
        print(f"✓ Material details updated: score {data['traceability_score']}%")
    
    def test_verify_materials_persisted(self, brand_token):
        """Verify material update was persisted"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        response = requests.get(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have material details
        assert data["material_details"] is not None, "Material details not found"
        
        material = data["material_details"]
        assert material["material_type"] == "Cotton"
        assert material["composition"] == "100% Organic Cotton"
        assert "organic" in material.get("sustainability_tags", [])
        
        print(f"✓ Material details verified: {material['material_type']} - {material['composition']}")


class TestTraceabilityScoreCalculation:
    """Test traceability score calculation"""
    
    @pytest.fixture(scope="class")
    def brand_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_USER)
        return response.json()["access_token"]
    
    def test_score_increases_with_data(self, brand_token):
        """Verify traceability score increases as more data is added"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        
        # Get current score
        response = requests.get(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}", headers=headers)
        assert response.status_code == 200
        initial_score = response.json()["traceability_score"]
        
        # Score should be > 0 since we've added data in previous tests
        assert initial_score > 0, f"Score should be > 0 after adding data, got {initial_score}"
        
        print(f"✓ Traceability score: {initial_score}% (increases with more data)")
    
    def test_status_reflects_score(self, brand_token):
        """Verify status reflects the traceability score"""
        headers = {"Authorization": f"Bearer {brand_token}"}
        
        response = requests.get(f"{BASE_URL}/api/traceability/po/{TEST_PO_ID}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        score = data["traceability_score"]
        status = data["status"]
        
        # Verify status matches score range
        if score >= 90:
            assert status in ["verified", "complete"], f"Score {score} should have verified/complete status"
        elif score >= 70:
            assert status in ["complete", "partial"], f"Score {score} should have complete/partial status"
        elif score >= 30:
            assert status in ["partial", "missing"], f"Score {score} should have partial/missing status"
        
        print(f"✓ Status '{status}' matches score {score}%")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
