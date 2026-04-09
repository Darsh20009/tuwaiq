#!/usr/bin/env python3
"""
Backend API Testing for Tuwaiq Humanitarian Services Association
Tests all critical API endpoints for the Arabic charity website
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class TuwaiqAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def log(self, message: str, test_type: str = "INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [{test_type}] {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None) -> tuple[bool, Any]:
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...", "TEST")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'PATCH':
                response = self.session.patch(url, json=data, headers=test_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.passed_tests.append(name)
                self.log(f"✅ PASSED - {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "No response"
                })
                self.log(f"❌ FAILED - {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"Response: {response.text[:200]}", "ERROR")
                return False, {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "expected": expected_status,
                "actual": "Exception"
            })
            self.log(f"❌ FAILED - {name} - Error: {str(e)}", "ERROR")
            return False, {}

    def test_basic_connectivity(self):
        """Test basic app connectivity"""
        self.log("=== Testing Basic Connectivity ===", "SECTION")
        return self.run_test("Basic App Load", "GET", "/", 200)

    def test_bank_accounts_api(self):
        """Test bank accounts API"""
        self.log("=== Testing Bank Accounts API ===", "SECTION")
        success, data = self.run_test("Get Bank Accounts", "GET", "/api/bank-accounts", 200)
        
        if success and isinstance(data, list):
            self.log(f"Found {len(data)} bank accounts", "INFO")
            for account in data:
                if 'bankName' in account and 'iban' in account:
                    self.log(f"Bank: {account.get('bankName', 'N/A')} - IBAN: {account.get('iban', 'N/A')}", "INFO")
        
        return success, data

    def test_content_api(self):
        """Test content management API"""
        self.log("=== Testing Content API ===", "SECTION")
        
        # Test about page content
        success1, data1 = self.run_test("Get About Content", "GET", "/api/content/about", 200)
        
        # Test other content pages
        success2, data2 = self.run_test("Get Vision Content", "GET", "/api/content/vision", 200)
        success3, data3 = self.run_test("Get Goals Content", "GET", "/api/content/goals", 200)
        
        return success1 and success2 and success3, {"about": data1, "vision": data2, "goals": data3}

    def test_services_api(self):
        """Test services API"""
        self.log("=== Testing Services API ===", "SECTION")
        
        # Get all services
        success1, services = self.run_test("Get All Services", "GET", "/api/services", 200)
        
        if success1 and isinstance(services, list):
            self.log(f"Found {len(services)} services", "INFO")
            
            # Test individual service endpoints
            service_tests = []
            for service in services:
                if 'slug' in service:
                    slug = service['slug']
                    success, data = self.run_test(f"Get Service: {slug}", "GET", f"/api/services/{slug}", 200)
                    service_tests.append(success)
                    if success:
                        self.log(f"Service '{service.get('title', slug)}' loaded successfully", "INFO")
            
            return success1 and all(service_tests), services
        
        return success1, services

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("=== Testing Authentication Endpoints ===", "SECTION")
        
        # Test registration endpoint (should fail without proper data)
        success1, _ = self.run_test("Register Endpoint Check", "POST", "/api/auth/register", 400, {})
        
        # Test login endpoint (should fail without credentials)
        success2, _ = self.run_test("Login Endpoint Check", "POST", "/api/auth/login", 401, {})
        
        # Test me endpoint (should return 401 when not authenticated)
        success3, _ = self.run_test("Me Endpoint (Unauthenticated)", "GET", "/api/auth/me", 401)
        
        return success1 and success2 and success3, {}

    def test_donation_endpoints(self):
        """Test donation-related endpoints"""
        self.log("=== Testing Donation Endpoints ===", "SECTION")
        
        # Test donation creation (should work without auth for anonymous donations)
        donation_data = {
            "amount": "100",
            "type": "water",
            "donorName": "Test Donor",
            "donorPhone": "0501234567"
        }
        
        success1, response = self.run_test("Create Donation", "POST", "/api/donations/create", 200, donation_data)
        
        if success1 and 'redirectUrl' in response:
            self.log(f"Donation created with callback URL: {response['redirectUrl']}", "INFO")
        
        return success1, response

    def test_contact_endpoint(self):
        """Test contact form endpoint"""
        self.log("=== Testing Contact Form ===", "SECTION")
        
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "0501234567",
            "subject": "Test Message",
            "message": "This is a test message from automated testing"
        }
        
        success, response = self.run_test("Submit Contact Form", "POST", "/api/contact", 200, contact_data)
        
        if success:
            self.log("Contact form submission successful", "INFO")
        
        return success, response

    def test_bank_transfer_submission(self):
        """Test bank transfer submission"""
        self.log("=== Testing Bank Transfer Submission ===", "SECTION")
        
        transfer_data = {
            "amount": "500",
            "type": "food",
            "bankName": "Test Bank",
            "transferDate": "2024-01-15",
            "receiptImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
            "donorName": "Test Donor",
            "donorPhone": "0501234567"
        }
        
        success, response = self.run_test("Submit Bank Transfer", "POST", "/api/bank-transfers", 201, transfer_data)
        
        if success:
            self.log("Bank transfer submission successful", "INFO")
        
        return success, response

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting Tuwaiq Backend API Tests", "START")
        self.log(f"Testing against: {self.base_url}", "INFO")
        
        # Run all test suites
        test_results = {}
        
        try:
            test_results['connectivity'] = self.test_basic_connectivity()
            test_results['bank_accounts'] = self.test_bank_accounts_api()
            test_results['content'] = self.test_content_api()
            test_results['services'] = self.test_services_api()
            test_results['auth'] = self.test_auth_endpoints()
            test_results['donations'] = self.test_donation_endpoints()
            test_results['contact'] = self.test_contact_endpoint()
            test_results['bank_transfer'] = self.test_bank_transfer_submission()
            
        except Exception as e:
            self.log(f"Critical error during testing: {str(e)}", "ERROR")
            return False
        
        # Print summary
        self.log("=" * 50, "SUMMARY")
        self.log(f"📊 Tests Summary: {self.tests_passed}/{self.tests_run} passed", "SUMMARY")
        
        if self.failed_tests:
            self.log("❌ Failed Tests:", "SUMMARY")
            for failure in self.failed_tests:
                error_msg = failure.get('error', f"Expected {failure.get('expected')}, got {failure.get('actual')}")
                self.log(f"  - {failure['test']}: {error_msg}", "FAIL")
        
        if self.passed_tests:
            self.log("✅ Passed Tests:", "SUMMARY")
            for test in self.passed_tests:
                self.log(f"  - {test}", "PASS")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"🎯 Success Rate: {success_rate:.1f}%", "SUMMARY")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = TuwaiqAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"💥 Critical error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())