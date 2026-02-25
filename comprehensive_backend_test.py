import requests
import sys
import json
import base64
from datetime import datetime

class CDLRecruiterComprehensiveTester:
    def __init__(self, base_url="https://driver-career-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_auth = ('admin', 'skillconnect2024')

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, auth=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            kwargs = {'headers': headers, 'timeout': 15}
            if auth:
                kwargs['auth'] = auth
            if data:
                kwargs['json'] = data

            if method == 'GET':
                response = requests.get(url, **kwargs)
            elif method == 'POST':
                response = requests.post(url, **kwargs)
            elif method == 'PUT':
                response = requests.put(url, **kwargs)
            elif method == 'DELETE':
                response = requests.delete(url, **kwargs)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:300]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    # ============== PUBLIC API TESTS ==============
    
    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_config(self):
        """Test GET /api/config - site configuration"""
        return self.run_test("Get Site Configuration", "GET", "config", 200)

    def test_submit_info_request(self):
        """Test POST /api/info-requests - info request form submission"""
        test_request = {
            "full_name": "Test Driver Mike",
            "phone": "(555) 999-8888",
            "email": "testdriver@example.com",
            "preferred_contact": "phone",
            "message": "Looking for regional routes with good home time"
        }
        
        return self.run_test(
            "Submit Info Request",
            "POST",
            "info-requests",
            200,
            data=test_request
        )

    def test_submit_driver_lead(self):
        """Test POST /api/leads - driver application submission"""
        test_lead = {
            "full_name": "Test Application Driver",
            "phone": "(555) 777-6666",
            "email": "testapp@example.com",
            "cdl_experience": 3,
            "zip_code": "75001"
        }
        
        return self.run_test(
            "Submit Driver Application",
            "POST",
            "leads",
            200,
            data=test_lead
        )

    def test_get_jobs(self):
        """Test GET /api/jobs - public job listings"""
        return self.run_test("Get Public Job Listings", "GET", "jobs", 200)

    def test_get_job_by_id(self, job_id):
        """Test GET /api/jobs/{id} - individual job details"""
        return self.run_test(
            f"Get Job Details (ID: {job_id[:8]}...)",
            "GET",
            f"jobs/{job_id}",
            200
        )

    # ============== ADMIN API TESTS ==============
    
    def test_admin_login(self):
        """Test POST /api/admin/login - admin authentication"""
        return self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            auth=self.admin_auth
        )

    def test_admin_get_stats(self):
        """Test GET /api/admin/stats - dashboard statistics"""
        return self.run_test(
            "Admin Dashboard Stats",
            "GET",
            "admin/stats",
            200,
            auth=self.admin_auth
        )

    def test_admin_update_config(self):
        """Test PUT /api/admin/config - update site configuration"""
        config_update = {
            "site_name": "Test CDL Hub",
            "powered_by_name": "Test LLC"
        }
        
        return self.run_test(
            "Admin Update Site Config",
            "PUT",
            "admin/config",
            200,
            data=config_update,
            auth=self.admin_auth
        )

    def test_admin_reset_counter(self):
        """Test POST /api/admin/config/reset-counter - reset application counter"""
        return self.run_test(
            "Admin Reset Application Counter",
            "POST",
            "admin/config/reset-counter",
            200,
            auth=self.admin_auth
        )

    def test_admin_get_jobs(self):
        """Test GET /api/admin/jobs - admin job management"""
        return self.run_test(
            "Admin Get All Jobs",
            "GET",
            "admin/jobs",
            200,
            auth=self.admin_auth
        )

    def test_admin_create_job(self):
        """Test POST /api/admin/jobs - create new job"""
        new_job = {
            "title": "Test Regional Driver",
            "location": "Test Region",
            "pay": "$1,500 - $1,800 / week",
            "job_type": "Full Time",
            "description": "Test job description for regional driving position",
            "requirements": ["Valid CDL-A", "2+ years experience"],
            "benefits": ["Health Insurance", "Weekly Home Time"],
            "is_active": True
        }
        
        return self.run_test(
            "Admin Create Job",
            "POST",
            "admin/jobs",
            200,
            data=new_job,
            auth=self.admin_auth
        )

    def test_admin_get_leads(self):
        """Test GET /api/admin/leads - view driver leads"""
        return self.run_test(
            "Admin Get Driver Leads",
            "GET",
            "admin/leads",
            200,
            auth=self.admin_auth
        )

    def test_admin_get_info_requests(self):
        """Test GET /api/admin/info-requests - view info requests"""
        return self.run_test(
            "Admin Get Info Requests",
            "GET",
            "admin/info-requests",
            200,
            auth=self.admin_auth
        )

    # ============== ERROR HANDLING TESTS ==============
    
    def test_invalid_admin_credentials(self):
        """Test admin endpoints with invalid credentials"""
        return self.run_test(
            "Invalid Admin Credentials",
            "GET",
            "admin/stats",
            401,
            auth=('wrong', 'credentials')
        )

    def test_missing_admin_auth(self):
        """Test admin endpoints without authentication"""
        return self.run_test(
            "Missing Admin Authentication",
            "GET",
            "admin/stats",
            401
        )

    def test_invalid_job_id(self):
        """Test getting non-existent job"""
        return self.run_test(
            "Invalid Job ID",
            "GET",
            "jobs/nonexistent-job-id",
            404
        )

    def test_invalid_info_request(self):
        """Test submitting invalid info request"""
        invalid_request = {
            "full_name": "Test",
            "phone": "invalid-phone",
            "email": "invalid-email"
        }
        
        return self.run_test(
            "Invalid Info Request",
            "POST",
            "info-requests",
            422,
            data=invalid_request
        )

def main():
    print("🚛 CDL Recruiter Comprehensive API Testing Suite")
    print("=" * 60)
    
    tester = CDLRecruiterComprehensiveTester()
    
    # Test public endpoints
    print("\n📋 TESTING PUBLIC ENDPOINTS")
    print("-" * 40)
    
    tester.test_api_root()
    success, config_data = tester.test_get_config()
    tester.test_submit_info_request()
    tester.test_submit_driver_lead()
    success, jobs_data = tester.test_get_jobs()
    
    # Test individual job if we have jobs
    if success and jobs_data and len(jobs_data) > 0:
        first_job_id = jobs_data[0].get('id')
        if first_job_id:
            tester.test_get_job_by_id(first_job_id)
    
    # Test admin endpoints
    print("\n🔐 TESTING ADMIN ENDPOINTS")
    print("-" * 40)
    
    tester.test_admin_login()
    tester.test_admin_get_stats()
    tester.test_admin_update_config()
    tester.test_admin_reset_counter()
    tester.test_admin_get_jobs()
    tester.test_admin_create_job()
    tester.test_admin_get_leads()
    tester.test_admin_get_info_requests()
    
    # Test error handling
    print("\n⚠️  TESTING ERROR HANDLING")
    print("-" * 40)
    
    tester.test_invalid_admin_credentials()
    tester.test_missing_admin_auth()
    tester.test_invalid_job_id()
    tester.test_invalid_info_request()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}")
            if 'error' in failure:
                print(f"     Error: {failure['error']}")
            else:
                print(f"     Expected: {failure.get('expected')}, Got: {failure.get('actual')}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    # Test configuration validation
    if config_data:
        print(f"\n🔧 Site Configuration:")
        print(f"   Site Name: {config_data.get('site_name', 'N/A')}")
        print(f"   Powered By: {config_data.get('powered_by_name', 'N/A')}")
        print(f"   Application Limit: {config_data.get('application_limit', 'N/A')}")
        print(f"   Applications Used: {config_data.get('applications_used', 'N/A')}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())