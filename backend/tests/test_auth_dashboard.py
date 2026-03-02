"""
Backend API Tests for TextileTrace Portal
Tests authentication and dashboard endpoints for all 4 user roles
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://textile-traceability.preview.emergentagent.com')

# Test credentials for all 4 roles
TEST_CREDENTIALS = {
    'admin': {'email': 'admin@textile.com', 'password': 'admin123'},
    'manufacturer': {'email': 'manufacturer@textile.com', 'password': 'manu123'},
    'brand': {'email': 'brand@textile.com', 'password': 'brand123'},
    'auditor': {'email': 'auditor@textile.com', 'password': 'audit123'}
}


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self, api_client):
        """Test that API health endpoint returns 200"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data


class TestAuthentication:
    """Authentication endpoint tests for all 4 roles"""
    
    def test_admin_login(self, api_client):
        """Test admin login with correct credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['admin'])
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == "admin@textile.com"
        assert data["user"]["status"] == "active"
    
    def test_manufacturer_login(self, api_client):
        """Test manufacturer login with correct credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['manufacturer'])
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "manufacturer"
        assert data["user"]["email"] == "manufacturer@textile.com"
    
    def test_brand_login(self, api_client):
        """Test brand login with correct credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['brand'])
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "brand"
        assert data["user"]["email"] == "brand@textile.com"
    
    def test_auditor_login(self, api_client):
        """Test auditor login with correct credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['auditor'])
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "auditor"
        assert data["user"]["email"] == "auditor@textile.com"
    
    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data


class TestUserRegistration:
    """User registration tests"""
    
    def test_register_new_manufacturer(self, api_client):
        """Test registering a new manufacturer"""
        import uuid
        unique_email = f"test_manufacturer_{uuid.uuid4().hex[:8]}@example.com"
        
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Test Manufacturer",
            "role": "manufacturer",
            "company_name": "Test Mfg Co"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == unique_email
        assert data["role"] == "manufacturer"
        assert data["status"] == "pending"  # Non-admin users start as pending
    
    def test_register_duplicate_email(self, api_client):
        """Test registering with existing email returns 400"""
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": "admin@textile.com",  # Existing email
            "password": "testpass123",
            "name": "Duplicate User",
            "role": "manufacturer",
            "company_name": "Dup Co"
        })
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower()


class TestAdminDashboard:
    """Admin dashboard endpoint tests"""
    
    @pytest.fixture
    def admin_token(self, api_client):
        """Get admin token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['admin'])
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin authentication failed")
    
    def test_admin_dashboard(self, api_client, admin_token):
        """Test admin dashboard endpoint returns expected data structure"""
        api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
        response = api_client.get(f"{BASE_URL}/api/dashboard/admin")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "users" in data
        assert "by_role" in data["users"]
        assert "pending_approvals" in data["users"]
        
        assert "transactions" in data
        assert "batches" in data
        assert "by_status" in data["batches"]
        
        assert "audits" in data
        assert "materials" in data
        assert "alerts" in data
    
    def test_admin_dashboard_unauthorized(self, api_client):
        """Test admin dashboard without token returns 401"""
        response = api_client.get(f"{BASE_URL}/api/dashboard/admin")
        assert response.status_code == 401


class TestManufacturerDashboard:
    """Manufacturer dashboard endpoint tests"""
    
    @pytest.fixture
    def manufacturer_token(self, api_client):
        """Get manufacturer token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['manufacturer'])
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Manufacturer authentication failed")
    
    def test_manufacturer_dashboard(self, api_client, manufacturer_token):
        """Test manufacturer dashboard endpoint"""
        api_client.headers.update({"Authorization": f"Bearer {manufacturer_token}"})
        response = api_client.get(f"{BASE_URL}/api/dashboard/manufacturer")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "batches" in data
        assert "by_status" in data["batches"]
        assert "recent" in data["batches"]
        
        assert "materials" in data
        assert "production" in data
        assert "shipments" in data
        assert "audits" in data


class TestBrandDashboard:
    """Brand dashboard endpoint tests"""
    
    @pytest.fixture
    def brand_token(self, api_client):
        """Get brand token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['brand'])
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Brand authentication failed")
    
    def test_brand_dashboard(self, api_client, brand_token):
        """Test brand dashboard endpoint"""
        api_client.headers.update({"Authorization": f"Bearer {brand_token}"})
        response = api_client.get(f"{BASE_URL}/api/dashboard/brand")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "batches" in data
        assert "by_status" in data["batches"]
        
        assert "shipments" in data
        assert "audits" in data
        assert "compliance" in data
        assert "average_score" in data["compliance"]
        assert "total_assessed" in data["compliance"]


class TestAuditorDashboard:
    """Auditor dashboard endpoint tests"""
    
    @pytest.fixture
    def auditor_token(self, api_client):
        """Get auditor token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['auditor'])
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Auditor authentication failed")
    
    def test_auditor_dashboard(self, api_client, auditor_token):
        """Test auditor dashboard endpoint"""
        api_client.headers.update({"Authorization": f"Bearer {auditor_token}"})
        response = api_client.get(f"{BASE_URL}/api/dashboard/auditor")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "audits" in data
        assert "by_status" in data["audits"]
        assert "pending" in data["audits"]
        assert "completed_this_month" in data["audits"]
        
        assert "performance" in data
        assert "average_compliance_score" in data["performance"]


class TestAuthMe:
    """Test /auth/me endpoint for getting current user"""
    
    @pytest.fixture
    def admin_token(self, api_client):
        """Get admin token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['admin'])
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin authentication failed")
    
    def test_get_me(self, api_client, admin_token):
        """Test getting current user profile"""
        api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@textile.com"
        assert data["role"] == "admin"
        assert "id" in data


class TestLogout:
    """Test logout endpoint"""
    
    @pytest.fixture
    def admin_token(self, api_client):
        """Get admin token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['admin'])
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin authentication failed")
    
    def test_logout(self, api_client, admin_token):
        """Test logout endpoint"""
        api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
        response = api_client.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


class TestRoleBasedAccess:
    """Test role-based access control"""
    
    @pytest.fixture
    def manufacturer_token(self, api_client):
        """Get manufacturer token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['manufacturer'])
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Manufacturer authentication failed")
    
    def test_manufacturer_cannot_access_admin_dashboard(self, api_client, manufacturer_token):
        """Test that manufacturer cannot access admin dashboard"""
        api_client.headers.update({"Authorization": f"Bearer {manufacturer_token}"})
        response = api_client.get(f"{BASE_URL}/api/dashboard/admin")
        assert response.status_code == 403


class TestPendingUsers:
    """Test pending users endpoint for admin"""
    
    @pytest.fixture
    def admin_token(self, api_client):
        """Get admin token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS['admin'])
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin authentication failed")
    
    def test_get_pending_users(self, api_client, admin_token):
        """Test getting pending users list"""
        api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
        response = api_client.get(f"{BASE_URL}/api/users/pending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
