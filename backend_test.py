#!/usr/bin/env python3
"""
HAMMR Backend API Testing Suite

Tests all backend APIs for the HAMMR home services platform:
- Authentication (Register/Login/Me)
- Services API (List/Get single)  
- Jobs Workflow (Create/Accept/Start/Complete/Rate)
- User Management (Admin features)
- Finance Summary and Contractor Earnings
- AI Tools (Pricing Engine, Marketing Assistant)

Base URL: https://contractor-connect-36.preview.emergentagent.com/api
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import time

# Configuration
BASE_URL = "https://contractor-connect-36.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test credentials
TEST_USERS = {
    "admin": {"email": "admin@hammr.com", "password": "admin123"},
    "contractor": {"email": "contractor1@hammr.com", "password": "password123"},  
    "customer": {"email": "customer1@hammr.com", "password": "password123"}
}

# Global variables to store tokens and data
tokens = {}
test_data = {}
test_results = []

class TestResult:
    def __init__(self, name, endpoint, method, expected_status=200):
        self.name = name
        self.endpoint = endpoint
        self.method = method
        self.expected_status = expected_status
        self.actual_status = None
        self.success = False
        self.error = None
        self.response_data = None
        self.execution_time = 0

def log_test(result):
    """Log test result"""
    status = "✅ PASS" if result.success else "❌ FAIL"
    print(f"{status} {result.name} ({result.method} {result.endpoint})")
    if result.error:
        print(f"   Error: {result.error}")
    if not result.success and result.response_data:
        print(f"   Response: {result.response_data}")
    test_results.append(result)

def make_request(method, endpoint, data=None, token=None, expected_status=200):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    headers = HEADERS.copy()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    result = TestResult(
        name=f"{method.upper()} {endpoint}",
        endpoint=endpoint,
        method=method,
        expected_status=expected_status
    )
    
    try:
        start_time = time.time()
        
        if method.lower() == 'get':
            response = requests.get(url, headers=headers, timeout=30)
        elif method.lower() == 'post':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.lower() == 'put':
            response = requests.put(url, json=data, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        result.execution_time = time.time() - start_time
        result.actual_status = response.status_code
        
        try:
            result.response_data = response.json()
        except:
            result.response_data = response.text
        
        if response.status_code == expected_status:
            result.success = True
            return response
        else:
            result.error = f"Expected {expected_status}, got {response.status_code}"
            return response
            
    except requests.exceptions.RequestException as e:
        result.error = f"Request failed: {str(e)}"
        return None
    except Exception as e:
        result.error = f"Unexpected error: {str(e)}"
        return None
    finally:
        log_test(result)

def test_health_check():
    """Test basic health endpoints"""
    print("\n=== HEALTH CHECK ===")
    
    # Test root endpoint
    make_request("GET", "/")
    
    # Test health endpoint
    make_request("GET", "/health")

def test_authentication():
    """Test authentication endpoints"""
    print("\n=== AUTHENTICATION TESTS ===")
    
    # Test login for all test users
    for role, credentials in TEST_USERS.items():
        print(f"\n--- Testing {role} login ---")
        response = make_request("POST", "/auth/login", credentials)
        
        if response and response.status_code == 200:
            data = response.json()
            if "token" in data:
                tokens[role] = data["token"]
                test_data[f"{role}_user"] = data.get("user", {})
                print(f"   ✓ {role} token obtained")
            else:
                print(f"   ✗ No token in {role} login response")
        else:
            print(f"   ✗ {role} login failed")
    
    # Test /auth/me for each user
    for role, token in tokens.items():
        print(f"\n--- Testing {role} /auth/me ---")
        make_request("GET", "/auth/me", token=token)

def test_services():
    """Test services endpoints"""
    print("\n=== SERVICES TESTS ===")
    
    # Get all services
    response = make_request("GET", "/services")
    if response and response.status_code == 200:
        services = response.json()
        if services:
            test_data["services"] = services
            print(f"   ✓ Found {len(services)} services")
            
            # Test get single service
            service_id = services[0]["id"]
            make_request("GET", f"/services/{service_id}")
        else:
            print("   ⚠ No services found - database may not be seeded")
    
    # Test featured services
    make_request("GET", "/services?featured=true")
    
    # Test services by category
    make_request("GET", "/services?category=Repair")

def test_job_workflow():
    """Test complete job workflow"""
    print("\n=== JOBS WORKFLOW TESTS ===")
    
    if not tokens.get("customer") or not tokens.get("contractor"):
        print("   ✗ Cannot test job workflow - missing customer or contractor tokens")
        return
    
    if not test_data.get("services"):
        print("   ✗ Cannot test job workflow - no services available")
        return
    
    # Step 1: Customer creates a job
    print("\n--- Customer creates job ---")
    service = test_data["services"][0]
    job_data = {
        "service_id": service["id"],
        "description": "Test job - need plumbing repair in my kitchen",
        "location": "San Salvador, El Salvador",
        "scheduled_date": "2025-01-20",
        "budget": 75.0
    }
    
    response = make_request("POST", "/jobs", job_data, token=tokens["customer"])
    if response and response.status_code == 200:
        job = response.json()
        test_data["test_job"] = job
        print(f"   ✓ Job created with ID: {job['id']}")
    else:
        print("   ✗ Failed to create job")
        return
    
    # Step 2: Test get jobs for customer
    print("\n--- Customer views their jobs ---")
    make_request("GET", "/jobs", token=tokens["customer"])
    
    # Step 3: Contractor views available jobs
    print("\n--- Contractor views available jobs ---")
    make_request("GET", "/jobs/available", token=tokens["contractor"])
    
    # Step 4: Contractor accepts the job
    print("\n--- Contractor accepts job ---")
    job_id = test_data["test_job"]["id"]
    response = make_request("PUT", f"/jobs/{job_id}/accept", token=tokens["contractor"])
    
    # Step 5: Get job details
    print("\n--- Get job details ---")
    make_request("GET", f"/jobs/{job_id}", token=tokens["contractor"])
    
    # Step 6: Contractor starts the job
    print("\n--- Contractor starts job ---")
    make_request("PUT", f"/jobs/{job_id}/start", token=tokens["contractor"])
    
    # Step 7: Contractor completes the job
    print("\n--- Contractor completes job ---")
    make_request("PUT", f"/jobs/{job_id}/complete?final_price=80.0", token=tokens["contractor"])
    
    # Step 8: Customer rates the job
    print("\n--- Customer rates job ---")
    make_request("PUT", f"/jobs/{job_id}/rate?rating=5", token=tokens["customer"])
    
    # Step 9: Contractor rates the customer
    print("\n--- Contractor rates customer ---")
    make_request("PUT", f"/jobs/{job_id}/rate?rating=4", token=tokens["contractor"])

def test_user_management():
    """Test user management (admin only)"""
    print("\n=== USER MANAGEMENT TESTS ===")
    
    if not tokens.get("admin"):
        print("   ✗ Cannot test user management - no admin token")
        return
    
    # Get all users
    response = make_request("GET", "/users", token=tokens["admin"])
    if response and response.status_code == 200:
        users = response.json()
        if users:
            test_data["all_users"] = users
            print(f"   ✓ Found {len(users)} users")
            
            # Find a contractor to verify
            contractor_user = None
            for user in users:
                if user["role"] == "contractor" and not user["is_verified"]:
                    contractor_user = user
                    break
            
            if contractor_user:
                # Test verify contractor
                print(f"\n--- Verifying contractor {contractor_user['full_name']} ---")
                make_request("PUT", f"/users/{contractor_user['id']}/verify", token=tokens["admin"])
                
                # Test get specific user
                make_request("GET", f"/users/{contractor_user['id']}", token=tokens["admin"])
            else:
                print("   ⚠ No unverified contractors found to test verification")
    
    # Test get contractors
    make_request("GET", "/contractors")
    
    # Test get verified contractors only
    make_request("GET", "/contractors?verified_only=true")
    
    # Test filter users by role
    make_request("GET", "/users?role=contractor", token=tokens["admin"])

def test_finance():
    """Test finance endpoints"""
    print("\n=== FINANCE TESTS ===")
    
    if not tokens.get("admin"):
        print("   ✗ Cannot test finance - no admin token")
        return
    
    # Test finance summary
    make_request("GET", "/finance/summary", token=tokens["admin"])
    
    # Test contractor earnings
    if test_data.get("contractor_user"):
        contractor_id = test_data["contractor_user"]["id"]
        make_request("GET", f"/finance/contractor/{contractor_id}", token=tokens["admin"])
        
        # Test contractor viewing their own earnings
        if tokens.get("contractor"):
            contractor_token_id = test_data.get("contractor_user", {}).get("id")
            if contractor_token_id:
                make_request("GET", f"/finance/contractor/{contractor_token_id}", token=tokens["contractor"])

def test_ai_tools():
    """Test AI-powered tools"""
    print("\n=== AI TOOLS TESTS ===")
    
    if not tokens.get("admin"):
        print("   ✗ Cannot test AI tools - no admin token")
        return
    
    # Test AI Pricing Engine
    print("\n--- AI Pricing Engine ---")
    pricing_data = {
        "job_type": "Plumbing Repair",
        "complexity": "Medium",
        "location": "San Salvador",
        "demand": "High"
    }
    make_request("POST", "/ai/pricing", pricing_data, token=tokens["admin"])
    
    # Test AI Marketing Assistant
    print("\n--- AI Marketing Assistant ---")
    marketing_data = {
        "segment": "homeowners",
        "category": "Plumbing",
        "platform": "Facebook"
    }
    make_request("POST", "/ai/marketing", marketing_data, token=tokens["admin"])

def test_edge_cases():
    """Test edge cases and error conditions"""
    print("\n=== EDGE CASES & ERROR HANDLING ===")
    
    # Test unauthorized access
    print("\n--- Unauthorized access tests ---")
    make_request("GET", "/users", expected_status=401)  # No token
    make_request("GET", "/finance/summary", expected_status=401)  # No token
    
    # Test non-existent resources
    print("\n--- Non-existent resource tests ---")
    make_request("GET", "/services/non-existent-id", expected_status=404)
    make_request("GET", "/jobs/non-existent-id", token=tokens.get("customer"), expected_status=404)
    
    # Test invalid job operations
    if tokens.get("customer"):
        print("\n--- Invalid job operations ---")
        # Try to accept job as customer (should fail)
        if test_data.get("test_job"):
            job_id = test_data["test_job"]["id"]
            make_request("PUT", f"/jobs/{job_id}/accept", token=tokens["customer"], expected_status=403)

def test_database_seeding():
    """Test database seeding"""
    print("\n=== DATABASE SEEDING TEST ===")
    
    # Test seed endpoint
    make_request("POST", "/seed", expected_status=200)

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for r in test_results if r.success)
    failed = len(test_results) - passed
    
    print(f"Total tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success rate: {passed/len(test_results)*100:.1f}%")
    
    if failed > 0:
        print(f"\n❌ FAILED TESTS ({failed}):")
        for result in test_results:
            if not result.success:
                print(f"   • {result.name}: {result.error}")
    
    print(f"\n✅ PASSED TESTS ({passed}):")
    for result in test_results:
        if result.success:
            print(f"   • {result.name}")
    
    # Critical workflow test
    critical_tests = [
        "POST /auth/login",
        "GET /auth/me", 
        "GET /services",
        "POST /jobs",
        "PUT /jobs/",  # accept, start, complete
        "GET /finance/summary",
        "POST /ai/pricing"
    ]
    
    critical_passed = 0
    for result in test_results:
        for critical in critical_tests:
            if critical in result.name and result.success:
                critical_passed += 1
                break
    
    print(f"\n🎯 CRITICAL WORKFLOW: {critical_passed}/{len(critical_tests)} core features working")

def main():
    """Run all tests"""
    print("HAMMR Backend API Test Suite")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Users: {list(TEST_USERS.keys())}")
    print("="*60)
    
    try:
        # Run all test suites
        test_health_check()
        test_database_seeding()  # Ensure data exists
        test_authentication()
        test_services()
        test_job_workflow()
        test_user_management()
        test_finance()
        test_ai_tools()
        test_edge_cases()
        
        print_summary()
        
        # Return appropriate exit code
        failed_count = sum(1 for r in test_results if not r.success)
        if failed_count > 0:
            print(f"\n⚠️  {failed_count} tests failed")
            return 1
        else:
            print(f"\n🎉 All tests passed!")
            return 0
            
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\nUnexpected error during test execution: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())