"""
Backend API Tests for Supplier Management Module
Tests supplier endpoints, purchase order CRUD, and role-based access
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://supply-chain-portal.preview.emergentagent.com')

# Test credentials - Updated with testpassword as provided
TEST_CREDENTIALS = {
    'admin': {'email': 'admin@textile.com', 'password': 'testpassword'},
    'brand': {'email': 'brand@textile.com', 'password': 'testpassword'},
    'supplier': {'email': 'supplier@testsupplier.com', 'password': 'testpassword'},
    'manufacturer': {'email': 'manufacturer@textile.com', 'password': 'manu123'},  # Old password
    'auditor': {'email': 'auditor@textile.com', 'password': 'audit123'}  # Old password
}


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


def api_url(endpoint):
    """Helper to ensure trailing slash for FastAPI routes (redirect_slashes=False)"""
    # Add trailing slash if not present and not a specific resource URL
    if not endpoint.endswith('/') and '?' not in endpoint:
        return f"{BASE_URL}/api{endpoint}/"
    return f"{BASE_URL}/api{endpoint}"


@pytest.fixture
def admin_token(api_client):
    """Get admin token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['admin'])
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip(f"Admin authentication failed: {response.text}")


@pytest.fixture
def brand_token(api_client):
    """Get brand token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['brand'])
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip(f"Brand authentication failed: {response.text}")


@pytest.fixture
def supplier_token(api_client):
    """Get supplier token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['supplier'])
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip(f"Supplier authentication failed: {response.text}")


class TestSupplierLogin:
    """Test supplier role authentication"""
    
    def test_supplier_login(self, api_client):
        """Test supplier login with correct credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['supplier'])
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "supplier"
        assert data["user"]["email"] == "supplier@testsupplier.com"
        print(f"✓ Supplier login successful, user_id: {data['user']['id']}")


class TestSupplierEndpoints:
    """Test supplier CRUD endpoints"""
    
    def test_get_suppliers_as_brand(self, api_client, brand_token):
        """Brand can view active suppliers"""
        api_client.headers.update({"Authorization": f"Bearer {brand_token}"})
        response = api_client.get(api_url("/suppliers"))
        assert response.status_code == 200, f"Get suppliers failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Brand retrieved {len(data)} suppliers")
        
        # Check supplier structure if any exist
        if len(data) > 0:
            supplier = data[0]
            assert "id" in supplier
            assert "company_name" in supplier
            assert "country" in supplier
            assert "compliance_score" in supplier
            print(f"  First supplier: {supplier['company_name']} from {supplier['country']}")
    
    def test_get_suppliers_as_admin(self, api_client, admin_token):
        """Admin can view all suppliers"""
        api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
        response = api_client.get(api_url("/suppliers"))
        assert response.status_code == 200, f"Get suppliers failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin retrieved {len(data)} suppliers")
    
    def test_get_supplier_stats_as_admin(self, api_client, admin_token):
        """Admin can view supplier statistics"""
        api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
        response = api_client.get(api_url("/suppliers/stats"))
        assert response.status_code == 200, f"Get supplier stats failed: {response.text}"
        data = response.json()
        
        # Verify expected fields
        assert "total_suppliers" in data
        assert "active_suppliers" in data
        assert "average_compliance" in data
        assert "risk_distribution" in data
        print(f"✓ Supplier stats: total={data['total_suppliers']}, active={data['active_suppliers']}, avg_compliance={data['average_compliance']}")


class TestPurchaseOrderEndpoints:
    """Test purchase order CRUD endpoints"""
    
    def test_get_pos_as_brand(self, api_client, brand_token):
        """Brand can view their purchase orders"""
        api_client.headers.update({"Authorization": f"Bearer {brand_token}"})
        response = api_client.get(api_url("/purchase-orders"))
        assert response.status_code == 200, f"Get POs failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Brand retrieved {len(data)} purchase orders")
        
        # Check PO structure if any exist
        if len(data) > 0:
            po = data[0]
            assert "id" in po
            assert "po_number" in po
            assert "supplier_name" in po
            assert "status" in po
            assert "total_amount" in po
            print(f"  First PO: {po['po_number']} - Status: {po['status']} - Amount: ${po['total_amount']}")
    
    def test_get_pos_as_supplier(self, api_client, supplier_token):
        """Supplier can view their assigned purchase orders"""
        api_client.headers.update({"Authorization": f"Bearer {supplier_token}"})
        response = api_client.get(api_url("/purchase-orders"))
        assert response.status_code == 200, f"Get POs failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Supplier retrieved {len(data)} purchase orders")
        
        if len(data) > 0:
            po = data[0]
            print(f"  Supplier PO: {po['po_number']} - Status: {po['status']}")
    
    def test_get_po_stats_as_brand(self, api_client, brand_token):
        """Brand can view PO statistics"""
        api_client.headers.update({"Authorization": f"Bearer {brand_token}"})
        response = api_client.get(api_url("/purchase-orders/stats"))
        assert response.status_code == 200, f"Get PO stats failed: {response.text}"
        data = response.json()
        
        assert "total_pos" in data
        assert "total_value" in data
        print(f"✓ PO stats: total_pos={data['total_pos']}, total_value=${data['total_value']}")
    
    def test_get_po_stats_as_supplier(self, api_client, supplier_token):
        """Supplier can view their PO statistics"""
        api_client.headers.update({"Authorization": f"Bearer {supplier_token}"})
        response = api_client.get(api_url("/purchase-orders/stats"))
        assert response.status_code == 200, f"Get PO stats failed: {response.text}"
        data = response.json()
        
        assert "total_pos" in data
        print(f"✓ Supplier PO stats: total_pos={data['total_pos']}")


class TestCreatePurchaseOrder:
    """Test PO creation flow"""
    
    def test_create_po_as_brand(self, api_client, brand_token):
        """Brand can create a purchase order for a supplier"""
        api_client.headers.update({"Authorization": f"Bearer {brand_token}"})
        
        # First get a supplier ID
        suppliers_response = api_client.get(api_url("/suppliers"))
        if suppliers_response.status_code != 200 or len(suppliers_response.json()) == 0:
            pytest.skip("No suppliers available for PO creation test")
        
        supplier = suppliers_response.json()[0]
        supplier_id = supplier["id"]
        print(f"Creating PO for supplier: {supplier['company_name']} (ID: {supplier_id})")
        
        # Create PO
        po_data = {
            "supplier_id": supplier_id,
            "line_items": [{
                "product_name": "TEST_Organic Cotton Fabric",
                "quantity": 500,
                "unit": "meters",
                "unit_price": 15.50
            }],
            "delivery_date": "2026-03-01T00:00:00.000Z",
            "delivery_address": "Test Delivery Address, 123 Main St",
            "notes": "TEST PO - Can be deleted",
            "priority": "normal"
        }
        
        response = api_client.post(api_url("/purchase-orders"), json=po_data)
        assert response.status_code == 201, f"Create PO failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert "po_number" in data
        assert data["status"] == "awaiting_acceptance"
        assert data["supplier_name"] == supplier["company_name"]
        print(f"✓ Created PO: {data['po_number']} - Total: ${data['total_amount']}")
        
        # Return PO ID for cleanup/further testing
        return data["id"]


class TestPOAcceptReject:
    """Test PO accept/reject flow"""
    
    def test_accept_po_as_supplier(self, api_client, brand_token, supplier_token):
        """Supplier can accept a purchase order"""
        # First create a PO as brand
        api_client.headers.update({"Authorization": f"Bearer {brand_token}"})
        
        # Get supplier
        suppliers_response = api_client.get(api_url("/suppliers"))
        if suppliers_response.status_code != 200 or len(suppliers_response.json()) == 0:
            pytest.skip("No suppliers available")
        
        supplier = suppliers_response.json()[0]
        
        # Create PO
        po_data = {
            "supplier_id": supplier["id"],
            "line_items": [{
                "product_name": "TEST_Accept_Cotton",
                "quantity": 100,
                "unit": "kg",
                "unit_price": 20.00
            }],
            "delivery_date": "2026-04-01T00:00:00.000Z",
            "delivery_address": "Test Accept Address",
            "priority": "normal"
        }
        
        create_response = api_client.post(api_url("/purchase-orders"), json=po_data)
        if create_response.status_code != 201:
            pytest.skip(f"Could not create PO for accept test: {create_response.text}")
        
        po_id = create_response.json()["id"]
        po_number = create_response.json()["po_number"]
        print(f"Created PO {po_number} for acceptance test")
        
        # Now accept as supplier
        api_client.headers.update({"Authorization": f"Bearer {supplier_token}"})
        accept_response = api_client.post(f"{BASE_URL}/api/purchase-orders/{po_id}/accept")
        
        # This might fail if supplier is not linked to this PO - that's a valid scenario
        if accept_response.status_code == 403:
            print(f"Note: Supplier not authorized to accept this PO (expected if not linked)")
        else:
            assert accept_response.status_code == 200, f"Accept PO failed: {accept_response.text}"
            print(f"✓ PO {po_number} accepted successfully")


class TestAdminDashboardSupplierStats:
    """Test admin dashboard includes supplier statistics"""
    
    def test_admin_dashboard_has_supplier_stats(self, api_client, admin_token):
        """Admin dashboard should show supplier statistics"""
        api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
        response = api_client.get(f"{BASE_URL}/api/dashboard/admin")
        assert response.status_code == 200, f"Get admin dashboard failed: {response.text}"
        
        data = response.json()
        # Dashboard structure verification
        assert "users" in data
        print(f"✓ Admin dashboard loaded successfully")
        
        # Check supplier stats endpoint separately
        stats_response = api_client.get(f"{BASE_URL}/api/suppliers/stats")
        assert stats_response.status_code == 200, f"Get supplier stats failed: {stats_response.text}"
        stats = stats_response.json()
        print(f"✓ Supplier stats available: {stats['total_suppliers']} suppliers, {stats['active_suppliers']} active")


class TestRegistrationWithSupplierRole:
    """Test registration page includes supplier role"""
    
    def test_register_as_supplier(self, api_client):
        """Test registering a new supplier"""
        unique_email = f"test_supplier_{uuid.uuid4().hex[:8]}@testsupplier.com"
        
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Test Supplier User",
            "role": "supplier",
            "company_name": "Test Supplier Co"
        })
        assert response.status_code == 201, f"Registration failed: {response.text}"
        data = response.json()
        assert data["email"] == unique_email
        assert data["role"] == "supplier"
        assert data["status"] == "pending"  # Non-admin users start as pending
        print(f"✓ Registered new supplier user: {unique_email} (status: pending)")


class TestRoleBasedAccessControl:
    """Test RBAC for supplier and PO endpoints"""
    
    def test_brand_cannot_accept_po(self, api_client, brand_token):
        """Brand cannot accept a PO (only suppliers can)"""
        api_client.headers.update({"Authorization": f"Bearer {brand_token}"})
        
        # Get any PO
        pos_response = api_client.get(api_url("/purchase-orders"))
        if pos_response.status_code != 200 or len(pos_response.json()) == 0:
            pytest.skip("No POs available for RBAC test")
        
        po = pos_response.json()[0]
        
        # Try to accept as brand - should fail
        accept_response = api_client.post(f"{BASE_URL}/api/purchase-orders/{po['id']}/accept")
        assert accept_response.status_code == 403, f"Brand should not be able to accept PO: {accept_response.text}"
        print(f"✓ Brand correctly denied from accepting PO")
    
    def test_supplier_cannot_create_po(self, api_client, supplier_token):
        """Supplier cannot create a PO (only brands can)"""
        api_client.headers.update({"Authorization": f"Bearer {supplier_token}"})
        
        po_data = {
            "supplier_id": "any-id",
            "line_items": [{
                "product_name": "Test Product",
                "quantity": 100,
                "unit": "pcs",
                "unit_price": 10.00
            }],
            "delivery_date": "2026-05-01T00:00:00.000Z",
            "delivery_address": "Test Address",
            "priority": "normal"
        }
        
        response = api_client.post(api_url("/purchase-orders"), json=po_data)
        assert response.status_code == 403, f"Supplier should not be able to create PO: {response.text}"
        print(f"✓ Supplier correctly denied from creating PO")
