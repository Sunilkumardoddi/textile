"""
Supply Chain Command Center API Tests
Tests for /api/command-center/* endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://supply-chain-portal.preview.emergentagent.com')

# Test credentials
BRAND_EMAIL = "brand@textile.com"
BRAND_PASSWORD = "testpassword"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for brand user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": BRAND_EMAIL, "password": BRAND_PASSWORD}
    )
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.text}")
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(scope="module")
def supplier_id(auth_headers):
    """Get first supplier ID from command center"""
    response = requests.get(
        f"{BASE_URL}/api/command-center/suppliers",
        headers=auth_headers
    )
    if response.status_code != 200 or not response.json():
        pytest.skip("No suppliers available for testing")
    return response.json()[0]["id"]


class TestCommandCenterSuppliers:
    """Tests for /api/command-center/suppliers endpoint"""
    
    def test_get_suppliers_success(self, auth_headers):
        """Test getting suppliers list returns 200 and valid data"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/suppliers",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            supplier = data[0]
            assert "id" in supplier, "Supplier should have id"
            assert "name" in supplier, "Supplier should have name"
            print(f"Found {len(data)} suppliers")
    
    def test_get_suppliers_unauthorized(self):
        """Test getting suppliers without auth returns 401 or 403"""
        response = requests.get(f"{BASE_URL}/api/command-center/suppliers")
        assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code}"


class TestCommandCenterKPIs:
    """Tests for /api/command-center/supplier/{supplier_id}/kpis endpoint"""
    
    def test_get_kpis_success(self, auth_headers, supplier_id):
        """Test getting KPIs returns 200 and valid data structure"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/kpis",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "kpis" in data, "Response should have kpis"
        assert "trends" in data, "Response should have trends"
        assert "alerts" in data, "Response should have alerts"
        
        # Validate KPI fields
        kpis = data["kpis"]
        expected_kpi_fields = [
            "total_pos", "active_pos", "total_value", "production_progress",
            "quality_score", "on_time_delivery_rate", "compliance_score",
            "pending_reports", "active_alerts"
        ]
        for field in expected_kpi_fields:
            assert field in kpis, f"KPIs should have {field}"
        
        print(f"KPIs: Total POs={kpis['total_pos']}, Quality={kpis['quality_score']}%, Delivery={kpis['on_time_delivery_rate']}%")
    
    def test_get_kpis_with_season_filter(self, auth_headers, supplier_id):
        """Test getting KPIs with season filter"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/kpis",
            headers=auth_headers,
            params={"season_id": "nonexistent-season"}
        )
        
        # Should return 200 with empty/zero data for non-existent season
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


class TestCommandCenterOverview:
    """Tests for /api/command-center/supplier/{supplier_id}/overview endpoint"""
    
    def test_get_overview_success(self, auth_headers, supplier_id):
        """Test getting overview returns 200 and valid data"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/overview",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_fields = [
            "supplier_id", "total_pos", "active_pos", "completed_pos",
            "delayed_pos", "total_value", "total_quantity", "po_status_breakdown",
            "production_progress", "quality_score", "delivery_on_time_rate"
        ]
        for field in expected_fields:
            assert field in data, f"Overview should have {field}"
        
        print(f"Overview: Total POs={data['total_pos']}, Active={data['active_pos']}, Delayed={data['delayed_pos']}")


class TestCommandCenterProduction:
    """Tests for /api/command-center/supplier/{supplier_id}/production endpoint"""
    
    def test_get_production_success(self, auth_headers, supplier_id):
        """Test getting production data returns 200 and valid data"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/production",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_fields = [
            "overall_progress", "total_target", "total_actual",
            "wip_quantity", "daily_output_trend", "production_by_po"
        ]
        for field in expected_fields:
            assert field in data, f"Production should have {field}"
        
        print(f"Production: Progress={data['overall_progress']}%, Target={data['total_target']}, Actual={data['total_actual']}")


class TestCommandCenterQuality:
    """Tests for /api/command-center/supplier/{supplier_id}/quality endpoint"""
    
    def test_get_quality_success(self, auth_headers, supplier_id):
        """Test getting quality data returns 200 and valid data"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/quality",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_fields = [
            "average_dhu", "quality_score", "total_defects",
            "critical_defects", "dhu_trend", "defect_breakdown", "quality_by_po"
        ]
        for field in expected_fields:
            assert field in data, f"Quality should have {field}"
        
        print(f"Quality: Score={data['quality_score']}%, DHU={data['average_dhu']}%, Defects={data['total_defects']}")


class TestCommandCenterDelivery:
    """Tests for /api/command-center/supplier/{supplier_id}/delivery endpoint"""
    
    def test_get_delivery_success(self, auth_headers, supplier_id):
        """Test getting delivery data returns 200 and valid data"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/delivery",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_fields = [
            "total_deliveries", "on_time_deliveries", "delayed_deliveries",
            "on_time_rate", "average_delay_hours", "delivery_trend"
        ]
        for field in expected_fields:
            assert field in data, f"Delivery should have {field}"
        
        print(f"Delivery: Total={data['total_deliveries']}, On-Time={data['on_time_deliveries']}, Rate={data['on_time_rate']}%")


class TestCommandCenterCompliance:
    """Tests for /api/command-center/supplier/{supplier_id}/compliance endpoint"""
    
    def test_get_compliance_success(self, auth_headers, supplier_id):
        """Test getting compliance data returns 200 and valid data"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/compliance",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_fields = [
            "traceability_completion", "average_traceability_score",
            "average_compliance_score", "certified_pos", "risk_indicators"
        ]
        for field in expected_fields:
            assert field in data, f"Compliance should have {field}"
        
        print(f"Compliance: Traceability={data['average_traceability_score']}%, Compliance={data['average_compliance_score']}%")


class TestCommandCenterReports:
    """Tests for /api/command-center/supplier/{supplier_id}/reports endpoint"""
    
    def test_get_reports_success(self, auth_headers, supplier_id):
        """Test getting reports summary returns 200 and valid data"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/reports",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_fields = [
            "total_reports", "pending_reports", "approved_reports",
            "rejected_reports", "reports_by_type", "recent_reports"
        ]
        for field in expected_fields:
            assert field in data, f"Reports should have {field}"
        
        print(f"Reports: Total={data['total_reports']}, Pending={data['pending_reports']}, Approved={data['approved_reports']}")


class TestCommandCenterAlerts:
    """Tests for /api/command-center/supplier/{supplier_id}/alerts endpoint"""
    
    def test_get_alerts_success(self, auth_headers, supplier_id):
        """Test getting alerts returns 200 and valid data"""
        response = requests.get(
            f"{BASE_URL}/api/command-center/supplier/{supplier_id}/alerts",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_fields = ["total_alerts", "critical_alerts", "alerts"]
        for field in expected_fields:
            assert field in data, f"Alerts should have {field}"
        
        assert isinstance(data["alerts"], list), "Alerts should be a list"
        
        print(f"Alerts: Total={data['total_alerts']}, Critical={data['critical_alerts']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
