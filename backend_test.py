import requests
import sys
import json
from datetime import datetime
import base64

class CDLRecruiterAPITester:
    def __init__(self, base_url="https://driver-career-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_auth = None
        self.job_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test(
            "API Root",
            "GET",
            "",
            200
        )

    def test_seed_jobs(self):
        """Test job seeding endpoint"""
        return self.run_test(
            "Seed Job Listings",
            "POST",
            "jobs/seed",
            200
        )

    def test_get_jobs(self):
        """Test getting job listings"""
        return self.run_test(
            "Get Job Listings",
            "GET",
            "jobs",
            200
        )

    def test_submit_lead_valid(self):
        """Test submitting a valid driver lead"""
        test_lead = {
            "full_name": "John Test Driver",
            "phone": "(555) 123-4567",
            "email": "john.test@example.com",
            "cdl_experience": 5,
            "zip_code": "12345"
        }
        
        return self.run_test(
            "Submit Valid Driver Lead",
            "POST",
            "leads",
            200,
            data=test_lead
        )

    def test_submit_lead_invalid_email(self):
        """Test submitting lead with invalid email"""
        invalid_lead = {
            "full_name": "Jane Test Driver",
            "phone": "(555) 987-6543",
            "email": "invalid-email",
            "cdl_experience": 3,
            "zip_code": "54321"
        }
        
        success, _ = self.run_test(
            "Submit Lead with Invalid Email",
            "POST",
            "leads",
            422,  # Validation error expected
            data=invalid_lead
        )
        return success

    def test_submit_lead_missing_fields(self):
        """Test submitting lead with missing required fields"""
        incomplete_lead = {
            "full_name": "Incomplete Driver",
            "email": "incomplete@example.com"
            # Missing phone, cdl_experience, zip_code
        }
        
        success, _ = self.run_test(
            "Submit Lead with Missing Fields",
            "POST",
            "leads",
            422,  # Validation error expected
            data=incomplete_lead
        )
        return success

    def test_get_leads(self):
        """Test getting submitted leads"""
        return self.run_test(
            "Get Driver Leads",
            "GET",
            "leads",
            200
        )

    def test_job_by_id(self, job_id):
        """Test getting a specific job by ID"""
        return self.run_test(
            f"Get Job by ID: {job_id}",
            "GET",
            f"jobs/{job_id}",
            200
        )

    def test_nonexistent_job(self):
        """Test getting a non-existent job"""
        fake_id = "nonexistent-job-id-12345"
        success, _ = self.run_test(
            "Get Non-existent Job",
            "GET",
            f"jobs/{fake_id}",
            404
        )
        return success

    def test_admin_login(self):
        """Test admin login with correct credentials"""
        auth_header = {
            'Authorization': 'Basic ' + base64.b64encode(b'admin:skillconnect2024').decode('ascii'),
            'Content-Type': 'application/json'
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            headers=auth_header
        )
        
        if success:
            self.admin_auth = auth_header
        return success

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        auth_header = {
            'Authorization': 'Basic ' + base64.b64encode(b'admin:wrongpassword').decode('ascii'),
            'Content-Type': 'application/json'
        }
        
        success, _ = self.run_test(
            "Admin Login Invalid",
            "POST",
            "admin/login",
            401,
            headers=auth_header
        )
        return success

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not self.admin_auth:
            print("❌ Skipping admin stats test - not authenticated")
            return False
            
        return self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            headers=self.admin_auth
        )

    def test_admin_jobs(self):
        """Test admin jobs endpoint"""
        if not self.admin_auth:
            print("❌ Skipping admin jobs test - not authenticated")
            return False
            
        success, jobs_data = self.run_test(
            "Admin Jobs",
            "GET",
            "admin/jobs",
            200,
            headers=self.admin_auth
        )
        
        if success and jobs_data:
            self.job_ids = [job.get('id') for job in jobs_data if job.get('id')]
            print(f"   Found {len(self.job_ids)} jobs for tracking tests")
        
        return success

    def test_job_view_tracking(self):
        """Test job view tracking endpoint"""
        if not self.job_ids:
            print("❌ Skipping job view tracking test - no job IDs available")
            return False
            
        job_id = self.job_ids[0]
        return self.run_test(
            f"Track Job View for {job_id}",
            "POST",
            f"jobs/{job_id}/view",
            200
        )

    def test_admin_analytics_jobs(self):
        """Test admin job analytics endpoint"""
        if not self.admin_auth:
            print("❌ Skipping admin analytics test - not authenticated")
            return False
            
        return self.run_test(
            "Admin Job Analytics",
            "GET",
            "admin/analytics/jobs",
            200,
            headers=self.admin_auth
        )

    def test_download_leads_csv(self):
        """Test downloading leads CSV"""
        if not self.admin_auth:
            print("❌ Skipping CSV download test - not authenticated")
            return False
            
        url = f"{self.api_url}/admin/leads/download"
        print(f"\n🔍 Testing Download Leads CSV...")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, headers=self.admin_auth, timeout=10)
            success = response.status_code == 200
            
            self.tests_run += 1
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                print(f"   Content-Type: {response.headers.get('Content-Type', 'N/A')}")
                print(f"   Content-Length: {len(response.content)} bytes")
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                self.failed_tests.append({
                    'test': 'Download Leads CSV',
                    'expected': 200,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': 'Download Leads CSV',
                'error': str(e)
            })
            return False

    def test_download_info_requests_csv(self):
        """Test downloading info requests CSV"""
        if not self.admin_auth:
            print("❌ Skipping CSV download test - not authenticated")
            return False
            
        url = f"{self.api_url}/admin/info-requests/download"
        print(f"\n🔍 Testing Download Info Requests CSV...")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, headers=self.admin_auth, timeout=10)
            success = response.status_code == 200
            
            self.tests_run += 1
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                print(f"   Content-Type: {response.headers.get('Content-Type', 'N/A')}")
                print(f"   Content-Length: {len(response.content)} bytes")
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                self.failed_tests.append({
                    'test': 'Download Info Requests CSV',
                    'expected': 200,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': 'Download Info Requests CSV',
                'error': str(e)
            })
            return False

    def test_submit_info_request(self):
        """Test submitting an info request"""
        test_request = {
            "full_name": "Test Info Requester",
            "phone": "(555) 999-8888",
            "email": "test.info@example.com",
            "preferred_contact": "email",
            "message": "Looking for regional routes with good home time"
        }
        
        return self.run_test(
            "Submit Info Request",
            "POST",
            "info-requests",
            200,
            data=test_request
        )

def main():
    print("🚛 CDL Recruiter API Testing Suite")
    print("=" * 50)
    
    tester = CDLRecruiterAPITester()
    
    # Test API root
    tester.test_api_root()
    
    # Test job seeding and retrieval
    tester.test_seed_jobs()
    success, jobs_data = tester.test_get_jobs()
    
    # Test individual job retrieval if we have jobs
    if success and jobs_data and len(jobs_data) > 0:
        first_job_id = jobs_data[0].get('id')
        if first_job_id:
            tester.test_job_by_id(first_job_id)
    
    # Test non-existent job
    tester.test_nonexistent_job()
    
    # Test lead submission (valid and invalid)
    tester.test_submit_lead_valid()
    tester.test_submit_lead_invalid_email()
    tester.test_submit_lead_missing_fields()
    
    # Test getting leads
    tester.test_get_leads()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())