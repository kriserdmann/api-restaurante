#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class RestauranteAPITester:
    def __init__(self, base_url="https://menu-api-edu.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_product_id = None
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        # Add query parameters
        if params:
            param_str = "&".join([f"{k}={v}" for k, v in params.items()])
            url += f"?{param_str}"

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {"raw_response": response.text}
            else:
                self.log(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root endpoint"""
        success, response = self.run_test(
            "Root Endpoint",
            "GET", 
            "",
            200
        )
        return success

    def test_get_all_produtos(self):
        """Test GET /api/produtos"""
        success, response = self.run_test(
            "List All Products",
            "GET",
            "produtos",
            200
        )
        if success and isinstance(response, list):
            self.log(f"   Found {len(response)} products")
        return success

    def test_get_produtos_by_categoria(self):
        """Test GET /api/produtos?categoria=Entradas"""
        success, response = self.run_test(
            "Filter Products by Category",
            "GET",
            "produtos",
            200,
            params={"categoria": "Entradas"}
        )
        if success and isinstance(response, list):
            self.log(f"   Found {len(response)} products in Entradas category")
            # Verify all items are from correct category
            for item in response:
                if item.get('categoria') != 'Entradas':
                    self.log(f"❌ Category filter failed - found {item.get('categoria')}")
                    return False
        return success

    def test_get_produtos_destacados(self):
        """Test GET /api/produtos?destacado=true"""
        success, response = self.run_test(
            "Filter Featured Products",
            "GET",
            "produtos",
            200,
            params={"destacado": "true"}
        )
        if success and isinstance(response, list):
            self.log(f"   Found {len(response)} featured products")
            # Verify all items are featured
            for item in response:
                if not item.get('destacado'):
                    self.log(f"❌ Featured filter failed - found non-featured item")
                    return False
        return success

    def test_get_stats(self):
        """Test GET /api/stats"""
        success, response = self.run_test(
            "Get Statistics",
            "GET",
            "stats",
            200
        )
        if success:
            required_fields = ['total_produtos', 'total_entradas', 'total_pratos_principais', 
                             'total_sobremesas', 'total_bebidas', 'total_destacados']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing field in stats: {field}")
                    return False
            self.log(f"   Total products: {response.get('total_produtos')}")
            self.log(f"   Featured products: {response.get('total_destacados')}")
        return success

    def test_get_categorias(self):
        """Test GET /api/categorias"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categorias",
            200
        )
        if success and isinstance(response, list):
            self.log(f"   Found {len(response)} categories")
            expected_categories = ["Entradas", "Pratos Principais", "Sobremesas", "Bebidas"]
            for cat in expected_categories:
                if not any(item.get('value') == cat for item in response):
                    self.log(f"❌ Missing category: {cat}")
                    return False
        return success

    def test_create_produto(self):
        """Test POST /api/produtos"""
        test_product = {
            "nome": "Produto Teste API",
            "descricao": "Produto criado durante teste automatizado da API",
            "categoria": "Entradas",
            "preco": 29.90,
            "imagem": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
            "destacado": True
        }
        
        success, response = self.run_test(
            "Create New Product",
            "POST",
            "produtos",
            200,
            data=test_product
        )
        
        if success and response.get('id'):
            self.created_product_id = response['id']
            self.log(f"   Created product with ID: {self.created_product_id}")
        return success

    def test_get_produto_by_id(self):
        """Test GET /api/produtos/{id}"""
        if not self.created_product_id:
            self.log("⚠️  Skipping get by ID test - no product ID available")
            return False
            
        success, response = self.run_test(
            "Get Product by ID",
            "GET",
            f"produtos/{self.created_product_id}",
            200
        )
        
        if success:
            if response.get('id') != self.created_product_id:
                self.log(f"❌ ID mismatch - expected {self.created_product_id}, got {response.get('id')}")
                return False
            self.log(f"   Retrieved product: {response.get('nome')}")
        return success

    def test_update_produto(self):
        """Test PUT /api/produtos/{id}"""
        if not self.created_product_id:
            self.log("⚠️  Skipping update test - no product ID available")
            return False
            
        update_data = {
            "nome": "Produto Teste API - ATUALIZADO",
            "preco": 35.90,
            "destacado": False
        }
        
        success, response = self.run_test(
            "Update Product",
            "PUT",
            f"produtos/{self.created_product_id}",
            200,
            data=update_data
        )
        
        if success:
            if response.get('nome') != update_data['nome']:
                self.log(f"❌ Update failed - name not changed")
                return False
            self.log(f"   Updated product name to: {response.get('nome')}")
        return success

    def test_delete_produto(self):
        """Test DELETE /api/produtos/{id}"""
        if not self.created_product_id:
            self.log("⚠️  Skipping delete test - no product ID available")
            return False
            
        success, response = self.run_test(
            "Delete Product",
            "DELETE",
            f"produtos/{self.created_product_id}",
            200
        )
        
        if success:
            self.log(f"   Deleted product with ID: {self.created_product_id}")
            # Test that product is actually deleted
            success_get, _ = self.run_test(
                "Verify Deletion",
                "GET",
                f"produtos/{self.created_product_id}",
                404
            )
            if success_get:
                self.log("   ✅ Product successfully deleted")
            return success_get
        return success

    def test_seed_database(self):
        """Test POST /api/seed"""
        success, response = self.run_test(
            "Seed Database",
            "POST",
            "seed",
            200
        )
        
        if success:
            self.log(f"   {response.get('message', 'Database seeded successfully')}")
        return success

def main():
    print("🚀 Starting Restaurant API Tests")
    print("=" * 50)
    
    tester = RestauranteAPITester()
    
    # Test sequence
    tests = [
        ("Root endpoint", tester.test_root_endpoint),
        ("Seed database", tester.test_seed_database),
        ("Get all products", tester.test_get_all_produtos),
        ("Filter by category", tester.test_get_produtos_by_categoria),
        ("Filter featured products", tester.test_get_produtos_destacados),
        ("Get statistics", tester.test_get_stats),
        ("Get categories", tester.test_get_categorias),
        ("Create product", tester.test_create_produto),
        ("Get product by ID", tester.test_get_produto_by_id),
        ("Update product", tester.test_update_produto),
        ("Delete product", tester.test_delete_produto),
    ]
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        test_func()
    
    # Final results
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())