"""
Test Collections and Swatches API - Manufacturer Collection Module
Tests for:
- Collection CRUD operations (Brand role)
- Swatch upload and listing (Manufacturer role)
- Swatch selection/shortlisting (Brand role)
- Collection analytics
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://supply-chain-portal.preview.emergentagent.com')

# Test credentials from previous iterations
TEST_CREDENTIALS = {
    "brand": {"email": "brand@textile.com", "password": "testpassword"},
    "manufacturer": {"email": "manufacturer@textile.com", "password": "testpassword"},
    "admin": {"email": "admin@textile.com", "password": "testpassword"}
}

# Test data from agent context
TEST_SEASON_ID = "10c7d051-f0d8-42ac-a332-fd4d090efb73"
TEST_COLLECTION_ID = "0c701de1-12b4-414b-87ae-7d013f2eea20"
TEST_SWATCH_ID = "52bc8472-9257-4c39-89b1-66dc5b871840"


class TestAuth:
    """Authentication helper tests"""
    
    def test_brand_login(self):
        """Test brand user can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS["brand"])
        assert response.status_code == 200, f"Brand login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access token in response"
        return data["access_token"]
    
    def test_manufacturer_login(self):
        """Test manufacturer user can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS["manufacturer"])
        assert response.status_code == 200, f"Manufacturer login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access token in response"
        return data["access_token"]


@pytest.fixture
def brand_token():
    """Get brand auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS["brand"])
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Brand login failed")


@pytest.fixture
def manufacturer_token():
    """Get manufacturer auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_CREDENTIALS["manufacturer"])
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Manufacturer login failed")


@pytest.fixture
def brand_headers(brand_token):
    """Headers with brand auth"""
    return {"Authorization": f"Bearer {brand_token}"}


@pytest.fixture
def manufacturer_headers(manufacturer_token):
    """Headers with manufacturer auth"""
    return {"Authorization": f"Bearer {manufacturer_token}"}


class TestCollectionsAPI:
    """Test Collection CRUD operations"""
    
    def test_list_collections(self, brand_headers):
        """Test listing collections"""
        response = requests.get(f"{BASE_URL}/api/collections/", headers=brand_headers)
        assert response.status_code == 200, f"List collections failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Found {len(data)} collections")
        return data
    
    def test_list_collections_by_season(self, brand_headers):
        """Test listing collections filtered by season"""
        response = requests.get(
            f"{BASE_URL}/api/collections/",
            params={"season_id": TEST_SEASON_ID},
            headers=brand_headers
        )
        assert response.status_code == 200, f"List collections by season failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # All returned collections should belong to the specified season
        for col in data:
            assert col.get("season_id") == TEST_SEASON_ID, f"Collection {col.get('id')} has wrong season_id"
        print(f"Found {len(data)} collections for season {TEST_SEASON_ID}")
        return data
    
    def test_get_collection_by_id(self, brand_headers):
        """Test getting a specific collection"""
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}",
            headers=brand_headers
        )
        assert response.status_code == 200, f"Get collection failed: {response.text}"
        data = response.json()
        assert data.get("id") == TEST_COLLECTION_ID, "Collection ID mismatch"
        assert "name" in data, "Collection should have name"
        assert "collection_code" in data, "Collection should have collection_code"
        assert "season_id" in data, "Collection should have season_id"
        assert "status" in data, "Collection should have status"
        assert "total_swatches" in data, "Collection should have total_swatches count"
        print(f"Collection: {data.get('name')} ({data.get('collection_code')})")
        print(f"  Status: {data.get('status')}, Swatches: {data.get('total_swatches')}")
        return data
    
    def test_get_collection_analytics(self, brand_headers):
        """Test getting collection analytics"""
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/analytics",
            headers=brand_headers
        )
        assert response.status_code == 200, f"Get analytics failed: {response.text}"
        data = response.json()
        assert "collection" in data, "Analytics should include collection info"
        assert "total_swatches" in data, "Analytics should include total_swatches"
        assert "by_status" in data, "Analytics should include status breakdown"
        assert "by_fabric_type" in data, "Analytics should include fabric type breakdown"
        assert "sustainable_percentage" in data, "Analytics should include sustainable percentage"
        print(f"Analytics: {data.get('total_swatches')} swatches, {data.get('participating_suppliers')} suppliers")
        print(f"  By status: {data.get('by_status')}")
        return data
    
    def test_create_collection(self, brand_headers):
        """Test creating a new collection (Brand role)"""
        collection_data = {
            "name": "TEST_Collection_API_Test",
            "description": "Test collection created by API test",
            "season_id": TEST_SEASON_ID,
            "max_swatches_per_supplier": 100,
            "guidelines": "Test guidelines for suppliers",
            "categories": ["cotton", "silk"]
        }
        response = requests.post(
            f"{BASE_URL}/api/collections/",
            json=collection_data,
            headers=brand_headers
        )
        assert response.status_code == 200, f"Create collection failed: {response.text}"
        data = response.json()
        assert data.get("name") == collection_data["name"], "Name mismatch"
        assert data.get("season_id") == TEST_SEASON_ID, "Season ID mismatch"
        assert "id" in data, "Should return collection ID"
        assert "collection_code" in data, "Should generate collection code"
        assert data.get("status") == "open", "New collection should be open"
        print(f"Created collection: {data.get('id')} ({data.get('collection_code')})")
        return data
    
    def test_manufacturer_cannot_create_collection(self, manufacturer_headers):
        """Test that manufacturers cannot create collections"""
        collection_data = {
            "name": "TEST_Unauthorized_Collection",
            "season_id": TEST_SEASON_ID
        }
        response = requests.post(
            f"{BASE_URL}/api/collections/",
            json=collection_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("Correctly blocked manufacturer from creating collection")


class TestSwatchesAPI:
    """Test Swatch operations"""
    
    def test_list_swatches(self, brand_headers):
        """Test listing swatches in a collection"""
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches",
            headers=brand_headers
        )
        assert response.status_code == 200, f"List swatches failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Found {len(data)} swatches in collection")
        if len(data) > 0:
            swatch = data[0]
            assert "id" in swatch, "Swatch should have id"
            assert "name" in swatch, "Swatch should have name"
            assert "swatch_code" in swatch, "Swatch should have swatch_code"
            assert "image_url" in swatch, "Swatch should have image_url"
            assert "status" in swatch, "Swatch should have status"
            assert "metadata" in swatch, "Swatch should have metadata"
            print(f"  First swatch: {swatch.get('name')} ({swatch.get('swatch_code')})")
        return data
    
    def test_list_swatches_with_filters(self, brand_headers):
        """Test listing swatches with various filters"""
        # Test fabric_type filter
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches",
            params={"fabric_type": "cotton"},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Filter by fabric_type failed: {response.text}"
        
        # Test status filter
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches",
            params={"status": "uploaded"},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Filter by status failed: {response.text}"
        
        # Test search filter
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches",
            params={"search": "test"},
            headers=brand_headers
        )
        assert response.status_code == 200, f"Search filter failed: {response.text}"
        print("All swatch filters working")
    
    def test_get_swatch_count(self, brand_headers):
        """Test getting swatch counts"""
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches/count",
            headers=brand_headers
        )
        assert response.status_code == 200, f"Get swatch count failed: {response.text}"
        data = response.json()
        assert "total" in data, "Should include total count"
        assert "by_status" in data, "Should include status breakdown"
        assert "suppliers_count" in data, "Should include suppliers count"
        print(f"Swatch counts: total={data.get('total')}, suppliers={data.get('suppliers_count')}")
        print(f"  By status: {data.get('by_status')}")
        return data
    
    def test_upload_swatch_manufacturer(self, manufacturer_headers):
        """Test uploading a swatch (Manufacturer role)"""
        # Create a simple test image (1x1 pixel PNG)
        import base64
        # Minimal valid PNG
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        files = {
            'image': ('test_swatch.png', io.BytesIO(png_data), 'image/png')
        }
        data = {
            'name': 'TEST_API_Swatch_Upload',
            'fabric_type': 'cotton',
            'composition': '100% Cotton',
            'weave_type': 'woven',
            'gsm': '180',
            'color': 'Navy Blue',
            'color_code': '#000080',
            'pattern': 'Solid',
            'finish': 'Brushed',
            'price_per_meter': '12.50',
            'moq_meters': '500',
            'lead_time_days': '30',
            'tags': 'sustainable,organic',
            'certifications': 'GOTS,OEKO-TEX',
            'description': 'Test swatch uploaded via API test'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches",
            files=files,
            data=data,
            headers=manufacturer_headers
        )
        assert response.status_code == 200, f"Upload swatch failed: {response.text}"
        result = response.json()
        assert result.get("name") == data["name"], "Name mismatch"
        assert "id" in result, "Should return swatch ID"
        assert "swatch_code" in result, "Should generate swatch code"
        assert "image_url" in result, "Should have image URL"
        assert result.get("status") == "uploaded", "New swatch should have 'uploaded' status"
        print(f"Uploaded swatch: {result.get('id')} ({result.get('swatch_code')})")
        print(f"  Image URL: {result.get('image_url')}")
        return result
    
    def test_brand_cannot_upload_swatch(self, brand_headers):
        """Test that brands cannot upload swatches"""
        import base64
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        files = {
            'image': ('test.png', io.BytesIO(png_data), 'image/png')
        }
        data = {
            'name': 'TEST_Unauthorized_Swatch',
            'fabric_type': 'cotton',
            'composition': '100% Cotton',
            'weave_type': 'woven'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches",
            files=files,
            data=data,
            headers=brand_headers
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("Correctly blocked brand from uploading swatch")


class TestSwatchSelection:
    """Test swatch selection/shortlisting (Brand role)"""
    
    def test_shortlist_swatches(self, brand_headers):
        """Test shortlisting swatches"""
        # First get available swatches
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches",
            headers=brand_headers
        )
        assert response.status_code == 200
        swatches = response.json()
        
        if len(swatches) == 0:
            pytest.skip("No swatches available to shortlist")
        
        # Get first swatch that's not already shortlisted
        swatch_to_shortlist = None
        for s in swatches:
            if s.get("status") not in ["shortlisted", "selected"]:
                swatch_to_shortlist = s
                break
        
        if not swatch_to_shortlist:
            pytest.skip("All swatches already shortlisted/selected")
        
        # Shortlist the swatch
        selection_data = {
            "swatch_ids": [swatch_to_shortlist["id"]],
            "action": "shortlist",
            "notes": "Test shortlist via API"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches/select",
            json=selection_data,
            headers=brand_headers
        )
        assert response.status_code == 200, f"Shortlist failed: {response.text}"
        result = response.json()
        assert "message" in result, "Should return message"
        assert result.get("action") == "shortlist", "Action should be shortlist"
        print(f"Shortlisted swatch: {swatch_to_shortlist['id']}")
        return result
    
    def test_select_swatches(self, brand_headers):
        """Test selecting swatches"""
        # First get available swatches
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches",
            headers=brand_headers
        )
        assert response.status_code == 200
        swatches = response.json()
        
        if len(swatches) == 0:
            pytest.skip("No swatches available to select")
        
        # Get first swatch
        swatch_to_select = swatches[0]
        
        # Select the swatch
        selection_data = {
            "swatch_ids": [swatch_to_select["id"]],
            "action": "select",
            "notes": "Test select via API"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches/select",
            json=selection_data,
            headers=brand_headers
        )
        assert response.status_code == 200, f"Select failed: {response.text}"
        result = response.json()
        assert result.get("action") == "select", "Action should be select"
        print(f"Selected swatch: {swatch_to_select['id']}")
        return result
    
    def test_manufacturer_cannot_select_swatches(self, manufacturer_headers):
        """Test that manufacturers cannot select swatches"""
        selection_data = {
            "swatch_ids": [TEST_SWATCH_ID],
            "action": "shortlist"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches/select",
            json=selection_data,
            headers=manufacturer_headers
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("Correctly blocked manufacturer from selecting swatches")


class TestSupplierStats:
    """Test supplier statistics endpoints"""
    
    def test_get_supplier_stats(self, brand_headers):
        """Test getting supplier statistics for a collection"""
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/suppliers/stats",
            headers=brand_headers
        )
        assert response.status_code == 200, f"Get supplier stats failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        if len(data) > 0:
            stat = data[0]
            assert "supplier_id" in stat, "Should have supplier_id"
            assert "supplier_name" in stat, "Should have supplier_name"
            assert "total_uploaded" in stat, "Should have total_uploaded"
            assert "selection_rate" in stat, "Should have selection_rate"
            print(f"Found stats for {len(data)} suppliers")
            for s in data[:3]:  # Print first 3
                print(f"  {s.get('supplier_name')}: {s.get('total_uploaded')} uploaded, {s.get('selection_rate')}% selected")
        return data
    
    def test_get_duplicate_swatches(self, brand_headers):
        """Test getting duplicate swatches"""
        response = requests.get(
            f"{BASE_URL}/api/collections/{TEST_COLLECTION_ID}/swatches/duplicates",
            headers=brand_headers
        )
        assert response.status_code == 200, f"Get duplicates failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Found {len(data)} duplicate swatches")
        return data


class TestCollectionNotFound:
    """Test error handling for non-existent resources"""
    
    def test_get_nonexistent_collection(self, brand_headers):
        """Test getting a collection that doesn't exist"""
        response = requests.get(
            f"{BASE_URL}/api/collections/nonexistent-id-12345",
            headers=brand_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Correctly returned 404 for non-existent collection")
    
    def test_get_swatches_nonexistent_collection(self, brand_headers):
        """Test getting swatches from non-existent collection"""
        response = requests.get(
            f"{BASE_URL}/api/collections/nonexistent-id-12345/swatches",
            headers=brand_headers
        )
        # Should return empty list or 404
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        print(f"Returned {response.status_code} for swatches of non-existent collection")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
