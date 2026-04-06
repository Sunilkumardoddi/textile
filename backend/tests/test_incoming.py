"""
Incoming & Dispatch Management API Tests
Tests for: Dashboard overview, PO summary, dispatches, tracking, analytics, destinations, alerts
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://supply-chain-portal.preview.emergentagent.com').rstrip('/')

# Test credentials
BRAND_CREDENTIALS = {"email": "brand@textile.com", "password": "testpassword"}
MANUFACTURER_CREDENTIALS = {"email": "manufacturer@textile.com", "password": "testpassword"}

# Test PO ID from seed data
TEST_PO_ID = "61bc85e4-8d3c-4d1f-a533-b7c5cfda5bee"


@pytest.fixture(scope="module")
def brand_token():
    """Get brand user authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=BRAND_CREDENTIALS)
    assert response.status_code == 200, f"Brand login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def manufacturer_token():
    """Get manufacturer user authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=MANUFACTURER_CREDENTIALS)
    assert response.status_code == 200, f"Manufacturer login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture
def brand_headers(brand_token):
    """Headers with brand auth token"""
    return {"Authorization": f"Bearer {brand_token}", "Content-Type": "application/json"}


@pytest.fixture
def manufacturer_headers(manufacturer_token):
    """Headers with manufacturer auth token"""
    return {"Authorization": f"Bearer {manufacturer_token}", "Content-Type": "application/json"}


class TestDashboardOverview:
    """Tests for /api/incoming/dashboard/overview endpoint"""
    
    def test_dashboard_overview_returns_stats(self, brand_headers):
        """Dashboard overview should return all required stats"""
        response = requests.get(f"{BASE_URL}/api/incoming/dashboard/overview", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields are present
        required_fields = [
            "total_invoices", "total_dispatches", "in_transit", "delivered",
            "pending", "delayed", "total_quantity_dispatched", "total_quantity_received",
            "pending_quantity", "active_alerts", "alerts", "recent_dispatches_count"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify data types
        assert isinstance(data["total_invoices"], int)
        assert isinstance(data["in_transit"], int)
        assert isinstance(data["delivered"], int)
        assert isinstance(data["alerts"], list)
        
        print(f"Dashboard Overview: {data['total_invoices']} invoices, {data['in_transit']} in transit, {data['delivered']} delivered")
    
    def test_dashboard_overview_requires_auth(self):
        """Dashboard overview should require authentication"""
        response = requests.get(f"{BASE_URL}/api/incoming/dashboard/overview")
        assert response.status_code in [401, 403]  # Either unauthorized or forbidden


class TestPOsWithShipments:
    """Tests for /api/incoming/dashboard/pos-with-shipments endpoint"""
    
    def test_pos_with_shipments_returns_list(self, brand_headers):
        """POs with shipments should return list with enriched data"""
        response = requests.get(f"{BASE_URL}/api/incoming/dashboard/pos-with-shipments", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        if len(data) > 0:
            po = data[0]
            # Verify enriched fields
            enriched_fields = [
                "invoice_count", "dispatch_count", "total_dispatched",
                "total_received", "pending_quantity", "in_transit_count",
                "delivered_count", "delayed_count", "color_indicator"
            ]
            for field in enriched_fields:
                assert field in po, f"Missing enriched field: {field}"
            
            # Verify color indicator is valid
            assert po["color_indicator"] in ["green", "yellow", "red", "blue", "gray"]
            
            print(f"Found {len(data)} POs with shipments, first PO: {po.get('po_number')}")


class TestPOSummary:
    """Tests for /api/incoming/po/{po_id}/summary endpoint"""
    
    def test_po_summary_returns_complete_data(self, brand_headers):
        """PO summary should return invoices and dispatches"""
        response = requests.get(f"{BASE_URL}/api/incoming/po/{TEST_PO_ID}/summary", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        required_fields = [
            "po_id", "po_number", "supplier_name", "total_invoices",
            "total_quantity_ordered", "total_quantity_dispatched", "total_quantity_received",
            "quantity_pending", "pending_deliveries", "in_transit_count",
            "completed_deliveries", "delayed_count", "overall_delivery_status",
            "invoices", "dispatches"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify invoices and dispatches are lists
        assert isinstance(data["invoices"], list)
        assert isinstance(data["dispatches"], list)
        
        # Verify delivery status is valid
        valid_statuses = ["on_time", "slight_delay", "critical_delay", "pending"]
        assert data["overall_delivery_status"] in valid_statuses
        
        print(f"PO Summary: {data['total_invoices']} invoices, {data['in_transit_count']} in transit")
    
    def test_po_summary_not_found(self, brand_headers):
        """PO summary should return 404 for non-existent PO"""
        response = requests.get(f"{BASE_URL}/api/incoming/po/non-existent-id/summary", headers=brand_headers)
        assert response.status_code == 404


class TestDeliveryPerformance:
    """Tests for /api/incoming/analytics/delivery-performance endpoint"""
    
    def test_delivery_performance_returns_metrics(self, brand_headers):
        """Delivery performance should return all metrics"""
        response = requests.get(f"{BASE_URL}/api/incoming/analytics/delivery-performance", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        required_fields = [
            "total_deliveries", "on_time_deliveries", "slight_delay_deliveries",
            "critical_delay_deliveries", "on_time_percentage",
            "average_delay_hours", "average_transit_time_hours"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify percentage is valid
        assert 0 <= data["on_time_percentage"] <= 100
        
        print(f"Delivery Performance: {data['on_time_percentage']}% on-time rate")


class TestSupplierLogistics:
    """Tests for /api/incoming/analytics/supplier-logistics endpoint"""
    
    def test_supplier_logistics_returns_list(self, brand_headers):
        """Supplier logistics should return performance by supplier"""
        response = requests.get(f"{BASE_URL}/api/incoming/analytics/supplier-logistics", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        if len(data) > 0:
            supplier = data[0]
            required_fields = [
                "supplier_id", "supplier_name", "total_dispatches",
                "on_time_count", "delayed_count", "delay_frequency",
                "dispatch_efficiency", "average_transit_time"
            ]
            for field in required_fields:
                assert field in supplier, f"Missing field: {field}"
            
            print(f"Found {len(data)} suppliers with logistics data")


class TestDistanceDeliveryAnalysis:
    """Tests for /api/incoming/analytics/distance-delivery endpoint"""
    
    def test_distance_delivery_returns_analysis(self, brand_headers):
        """Distance delivery analysis should return data by distance range"""
        response = requests.get(f"{BASE_URL}/api/incoming/analytics/distance-delivery", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        if len(data) > 0:
            range_data = data[0]
            required_fields = [
                "distance_range", "total_deliveries", "average_transit_hours",
                "average_delay_hours", "on_time_percentage"
            ]
            for field in required_fields:
                assert field in range_data, f"Missing field: {field}"
            
            print(f"Found {len(data)} distance ranges with delivery data")


class TestSimulateTracking:
    """Tests for /api/incoming/dispatches/{id}/simulate-tracking endpoint"""
    
    def test_simulate_tracking_updates_location(self, brand_headers):
        """Simulate tracking should update dispatch location and status"""
        # First get a dispatch that's not delivered
        summary_response = requests.get(f"{BASE_URL}/api/incoming/po/{TEST_PO_ID}/summary", headers=brand_headers)
        assert summary_response.status_code == 200
        
        dispatches = summary_response.json().get("dispatches", [])
        active_dispatches = [d for d in dispatches if d["status"] not in ["delivered", "cancelled"]]
        
        if len(active_dispatches) > 0:
            dispatch_id = active_dispatches[0]["id"]
            
            response = requests.post(
                f"{BASE_URL}/api/incoming/dispatches/{dispatch_id}/simulate-tracking",
                headers=brand_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert "message" in data
            assert "new_status" in data
            assert "location" in data
            assert "progress" in data
            
            # Verify location has lat/lon
            assert "lat" in data["location"]
            assert "lon" in data["location"]
            
            print(f"Simulated tracking: {data['new_status']} at {data['progress']}% progress")
        else:
            pytest.skip("No active dispatches to simulate tracking")


class TestDestinations:
    """Tests for /api/incoming/destinations endpoints"""
    
    def test_get_destinations_returns_list(self, brand_headers):
        """Get destinations should return list of destinations"""
        response = requests.get(f"{BASE_URL}/api/incoming/destinations", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        if len(data) > 0:
            dest = data[0]
            required_fields = [
                "id", "name", "address", "city", "country",
                "latitude", "longitude", "destination_type", "is_active"
            ]
            for field in required_fields:
                assert field in dest, f"Missing field: {field}"
            
            print(f"Found {len(data)} destinations")


class TestAlerts:
    """Tests for /api/incoming/alerts endpoints"""
    
    def test_get_alerts_returns_list(self, brand_headers):
        """Get alerts should return list of alerts"""
        response = requests.get(f"{BASE_URL}/api/incoming/alerts", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        print(f"Found {len(data)} active alerts")


class TestDispatches:
    """Tests for /api/incoming/dispatches endpoints"""
    
    def test_get_dispatches_returns_list(self, brand_headers):
        """Get dispatches should return list of dispatches"""
        response = requests.get(f"{BASE_URL}/api/incoming/dispatches", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        if len(data) > 0:
            dispatch = data[0]
            required_fields = [
                "id", "dispatch_number", "invoice_id", "po_id",
                "quantity_dispatched", "status", "dispatch_date"
            ]
            for field in required_fields:
                assert field in dispatch, f"Missing field: {field}"
            
            print(f"Found {len(data)} dispatches")
    
    def test_get_dispatch_by_id(self, brand_headers):
        """Get dispatch by ID should return dispatch with tracking history"""
        # First get a dispatch ID
        dispatches_response = requests.get(f"{BASE_URL}/api/incoming/dispatches", headers=brand_headers)
        dispatches = dispatches_response.json()
        
        if len(dispatches) > 0:
            dispatch_id = dispatches[0]["id"]
            
            response = requests.get(f"{BASE_URL}/api/incoming/dispatches/{dispatch_id}", headers=brand_headers)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "tracking_history" in data
            assert isinstance(data["tracking_history"], list)
            
            print(f"Dispatch {data['dispatch_number']} has {len(data['tracking_history'])} tracking entries")
        else:
            pytest.skip("No dispatches available")


class TestInvoices:
    """Tests for /api/incoming/invoices endpoints"""
    
    def test_get_invoices_returns_list(self, brand_headers):
        """Get invoices should return list of invoices"""
        response = requests.get(f"{BASE_URL}/api/incoming/invoices", headers=brand_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        if len(data) > 0:
            invoice = data[0]
            required_fields = [
                "id", "invoice_number", "po_id", "quantity_shipped",
                "status", "destination_name", "dispatch_date"
            ]
            for field in required_fields:
                assert field in invoice, f"Missing field: {field}"
            
            print(f"Found {len(data)} invoices")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
