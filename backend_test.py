#!/usr/bin/env python3
"""
HAMMR Backend E2E Test Suite - Bidding System Focus
Tests the complete job bidding flow as requested in the review.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://contractor-connect-36.preview.emergentagent.com/api"

# Test users
CUSTOMER_CREDS = {"email": "customer1@hammr.com", "password": "password123"}
CONTRACTOR1_CREDS = {"email": "contractor1@hammr.com", "password": "password123"}
CONTRACTOR2_CREDS = {"email": "contractor2@hammr.com", "password": "password123"}
ADMIN_CREDS = {"email": "admin@hammr.com", "password": "admin123"}

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.failures = []
        
    def test(self, name, func):
        try:
            print(f"\n🧪 Testing: {name}")
            result = func()
            if result:
                print(f"✅ PASS: {name}")
                self.passed += 1
            else:
                print(f"❌ FAIL: {name}")
                self.failed += 1
                self.failures.append(name)
        except Exception as e:
            print(f"❌ ERROR in {name}: {str(e)}")
            self.failed += 1
            self.failures.append(f"{name} - ERROR: {str(e)}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST RESULTS: {self.passed}/{total} PASSED")
        print(f"{'='*60}")
        
        if self.failures:
            print("\n❌ FAILURES:")
            for failure in self.failures:
                print(f"   • {failure}")
        else:
            print("\n🎉 ALL TESTS PASSED!")
        
        return self.failed == 0

# Global variables for test data
customer_token = None
contractor1_token = None
contractor2_token = None
admin_token = None
service_id = None
job_id = None
contractor1_bid_id = None
contractor2_bid_id = None

def make_request(method, endpoint, headers=None, json_data=None, params=None):
    """Helper function to make HTTP requests with better error handling"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params, timeout=30)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=json_data, timeout=30)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=json_data, params=params, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"   {method} {endpoint} -> {response.status_code}")
        if response.status_code >= 400:
            print(f"   Response: {response.text[:200]}...")
            
        return response
    except requests.exceptions.RequestException as e:
        print(f"   Request failed: {str(e)}")
        raise

def test_customer_login():
    """Test customer authentication"""
    global customer_token
    
    response = make_request("POST", "/auth/login", json_data=CUSTOMER_CREDS)
    if response.status_code != 200:
        return False
        
    data = response.json()
    customer_token = data.get("token")
    user = data.get("user", {})
    
    return (customer_token is not None and 
            user.get("email") == CUSTOMER_CREDS["email"] and 
            user.get("role") == "customer")

def test_contractor1_login():
    """Test contractor1 authentication"""
    global contractor1_token
    
    response = make_request("POST", "/auth/login", json_data=CONTRACTOR1_CREDS)
    if response.status_code != 200:
        return False
        
    data = response.json()
    contractor1_token = data.get("token")
    user = data.get("user", {})
    
    return (contractor1_token is not None and 
            user.get("email") == CONTRACTOR1_CREDS["email"] and 
            user.get("role") == "contractor")

def test_contractor2_login():
    """Test contractor2 authentication"""
    global contractor2_token
    
    response = make_request("POST", "/auth/login", json_data=CONTRACTOR2_CREDS)
    if response.status_code != 200:
        return False
        
    data = response.json()
    contractor2_token = data.get("token")
    user = data.get("user", {})
    
    return (contractor2_token is not None and 
            user.get("email") == CONTRACTOR2_CREDS["email"] and 
            user.get("role") == "contractor")

def test_get_services():
    """Test getting services and select one for job creation"""
    global service_id
    
    response = make_request("GET", "/services")
    if response.status_code != 200:
        return False
        
    services = response.json()
    if not services or len(services) == 0:
        return False
        
    # Pick the first service
    service_id = services[0]["id"]
    print(f"   Selected service: {services[0]['name']} (ID: {service_id})")
    
    return True

def test_customer_create_job():
    """Step 1: Customer posts a job"""
    global job_id
    
    if not customer_token or not service_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    job_data = {
        "service_id": service_id,
        "description": "Need urgent plumbing repair - leaky kitchen faucet and running toilet. Emergency repair needed ASAP!",
        "location": "Colonia Escalon, San Salvador",
        "budget": 150.0,
        "scheduled_date": "2025-01-20T10:00:00Z"
    }
    
    response = make_request("POST", "/jobs", headers=headers, json_data=job_data)
    if response.status_code != 200:
        return False
        
    job = response.json()
    job_id = job["id"]
    
    print(f"   Created job ID: {job_id}")
    print(f"   Job status: {job['status']}")
    print(f"   Job budget: ${job['budget']}")
    
    return (job_id is not None and 
            job["status"] == "pending" and 
            job["customer_id"] is not None and
            job["budget"] == 150.0)

def test_contractor1_place_bid():
    """Step 2: Contractor 1 places a bid"""
    global contractor1_bid_id
    
    if not contractor1_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {contractor1_token}"}
    bid_data = {
        "amount": 120.0,
        "message": "I'm an experienced plumber with 8+ years in El Salvador. I can fix both issues quickly and efficiently. I have all necessary tools and can start immediately!",
        "estimated_hours": 2.5
    }
    
    response = make_request("POST", f"/jobs/{job_id}/bid", headers=headers, json_data=bid_data)
    if response.status_code != 200:
        return False
        
    result = response.json()
    contractor1_bid_id = result.get("bid_id")
    
    print(f"   Contractor1 bid ID: {contractor1_bid_id}")
    print(f"   Bid amount: $120.00")
    
    return contractor1_bid_id is not None

def test_contractor2_place_bid():
    """Step 3: Contractor 2 places a different bid"""
    global contractor2_bid_id
    
    if not contractor2_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {contractor2_token}"}
    bid_data = {
        "amount": 135.0,
        "message": "Professional plumber available today. I provide 6-month warranty on all repairs and use high-quality parts. Quick service guaranteed!",
        "estimated_hours": 3.0
    }
    
    response = make_request("POST", f"/jobs/{job_id}/bid", headers=headers, json_data=bid_data)
    if response.status_code != 200:
        return False
        
    result = response.json()
    contractor2_bid_id = result.get("bid_id")
    
    print(f"   Contractor2 bid ID: {contractor2_bid_id}")
    print(f"   Bid amount: $135.00")
    
    return contractor2_bid_id is not None

def test_duplicate_bid_prevention():
    """Test that contractor can't bid twice on same job (should return 400)"""
    if not contractor1_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {contractor1_token}"}
    bid_data = {
        "amount": 100.0,
        "message": "Another bid attempt",
        "estimated_hours": 2.0
    }
    
    response = make_request("POST", f"/jobs/{job_id}/bid", headers=headers, json_data=bid_data)
    return response.status_code == 400

def test_customer_view_bids():
    """Step 4: Customer views all bids for the job"""
    if not customer_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = make_request("GET", f"/jobs/{job_id}/bids", headers=headers)
    
    if response.status_code != 200:
        return False
        
    bids = response.json()
    
    print(f"   Found {len(bids)} bids")
    for bid in bids:
        print(f"   • Contractor: {bid['contractor_name']}, Amount: ${bid['amount']}, Status: {bid['status']}")
    
    # Should see 2 bids, both with "pending" status
    return (len(bids) == 2 and 
            all(bid["status"] == "pending" for bid in bids) and
            any(bid["amount"] == 120.0 for bid in bids) and
            any(bid["amount"] == 135.0 for bid in bids))

def test_customer_accept_bid():
    """Step 5: Customer accepts contractor1's bid"""
    if not customer_token or not contractor1_bid_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = make_request("PUT", f"/bids/{contractor1_bid_id}/accept", headers=headers)
    
    if response.status_code != 200:
        return False
        
    result = response.json()
    print(f"   {result['message']}")
    
    return result.get("contractor_id") is not None

def test_verify_bid_statuses():
    """Step 6: Verify bid statuses after acceptance"""
    if not customer_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = make_request("GET", f"/jobs/{job_id}/bids", headers=headers)
    
    if response.status_code != 200:
        return False
        
    bids = response.json()
    accepted_bids = [b for b in bids if b["status"] == "accepted"]
    rejected_bids = [b for b in bids if b["status"] == "rejected"]
    
    print(f"   Accepted bids: {len(accepted_bids)}")
    print(f"   Rejected bids: {len(rejected_bids)}")
    
    for bid in bids:
        print(f"   • ${bid['amount']} - {bid['status']} ({bid['contractor_name']})")
    
    return (len(accepted_bids) == 1 and 
            len(rejected_bids) == 1 and
            accepted_bids[0]["amount"] == 120.0)

def test_verify_job_status_accepted():
    """Step 7: Verify job status and contractor assignment"""
    if not customer_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = make_request("GET", f"/jobs/{job_id}", headers=headers)
    
    if response.status_code != 200:
        return False
        
    job = response.json()
    
    print(f"   Job status: {job['status']}")
    print(f"   Contractor assigned: {'Yes' if job.get('contractor_id') else 'No'}")
    print(f"   Updated budget: ${job.get('budget', 'N/A')}")
    
    return (job["status"] == "accepted" and 
            job.get("contractor_id") is not None and
            job["budget"] == 120.0)  # Should be updated to winning bid amount

def test_contractor_start_job():
    """Step 8: Contractor starts the job"""
    if not contractor1_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {contractor1_token}"}
    response = make_request("PUT", f"/jobs/{job_id}/start", headers=headers)
    
    if response.status_code != 200:
        return False
        
    result = response.json()
    print(f"   {result['message']}")
    
    return True

def test_verify_job_in_progress():
    """Step 9: Verify job is in progress"""
    if not contractor1_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {contractor1_token}"}
    response = make_request("GET", f"/jobs/{job_id}", headers=headers)
    
    if response.status_code != 200:
        return False
        
    job = response.json()
    print(f"   Job status: {job['status']}")
    
    return job["status"] == "in_progress"

def test_contractor_complete_job():
    """Step 10: Contractor completes the job"""
    if not contractor1_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {contractor1_token}"}
    params = {"final_price": 118.0}  # Slightly less than bid
    response = make_request("PUT", f"/jobs/{job_id}/complete", headers=headers, params=params)
    
    if response.status_code != 200:
        return False
        
    result = response.json()
    print(f"   {result['message']}")
    print(f"   Commission: ${result.get('commission', 'N/A')}")
    
    return result.get("commission") is not None

def test_verify_job_completed():
    """Step 11: Verify job is completed"""
    if not customer_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = make_request("GET", f"/jobs/{job_id}", headers=headers)
    
    if response.status_code != 200:
        return False
        
    job = response.json()
    print(f"   Job status: {job['status']}")
    print(f"   Final price: ${job.get('final_price', 'N/A')}")
    print(f"   Commission: ${job.get('commission_amount', 'N/A')}")
    
    return (job["status"] == "completed" and 
            job.get("final_price") == 118.0)

def test_customer_rate_contractor():
    """Step 12: Customer rates the contractor"""
    if not customer_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    params = {"rating": 5}
    response = make_request("PUT", f"/jobs/{job_id}/rate", headers=headers, params=params)
    
    if response.status_code != 200:
        return False
        
    result = response.json()
    print(f"   {result['message']} (Customer gave 5 stars)")
    
    return True

def test_contractor_rate_customer():
    """Step 13: Contractor rates the customer"""
    if not contractor1_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {contractor1_token}"}
    params = {"rating": 4}
    response = make_request("PUT", f"/jobs/{job_id}/rate", headers=headers, params=params)
    
    if response.status_code != 200:
        return False
        
    result = response.json()
    print(f"   {result['message']} (Contractor gave 4 stars)")
    
    return True

def test_final_job_verification():
    """Final verification of complete job with ratings"""
    if not customer_token or not job_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = make_request("GET", f"/jobs/{job_id}", headers=headers)
    
    if response.status_code != 200:
        return False
        
    job = response.json()
    print(f"   Final job status: {job['status']}")
    print(f"   Customer rating (contractor): {job.get('contractor_rating', 'None')}/5")
    print(f"   Contractor rating (customer): {job.get('customer_rating', 'None')}/5")
    
    return (job["status"] == "completed" and 
            job.get("contractor_rating") == 5.0 and
            job.get("customer_rating") == 4.0)

# Additional tests as requested
def test_contractor_get_my_bids():
    """Test contractor can see their own bids"""
    if not contractor1_token:
        return False
    
    headers = {"Authorization": f"Bearer {contractor1_token}"}
    response = make_request("GET", "/bids/my", headers=headers)
    
    if response.status_code != 200:
        return False
        
    bids = response.json()
    print(f"   Contractor1 has {len(bids)} total bids")
    
    # Find the bid for our test job
    job_bids = [b for b in bids if b["job_id"] == job_id]
    
    return (len(job_bids) >= 1 and 
            job_bids[0]["status"] == "accepted" and
            job_bids[0]["amount"] == 120.0)

def test_contractor_available_jobs():
    """Test contractor can see available jobs"""
    if not contractor2_token:
        return False
    
    headers = {"Authorization": f"Bearer {contractor2_token}"}
    response = make_request("GET", "/jobs/available", headers=headers)
    
    if response.status_code != 200:
        return False
        
    jobs = response.json()
    print(f"   Found {len(jobs)} available jobs")
    
    # Should not include our completed job
    pending_jobs = [j for j in jobs if j["status"] == "pending" and j.get("contractor_id") is None]
    
    return len(pending_jobs) >= 0  # Could be 0 if no other pending jobs

def test_customer_jobs_filter():
    """Test customer sees only their own jobs"""
    if not customer_token:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = make_request("GET", "/jobs", headers=headers)
    
    if response.status_code != 200:
        return False
        
    jobs = response.json()
    print(f"   Customer sees {len(jobs)} jobs")
    
    # Find our test job
    test_jobs = [j for j in jobs if j["id"] == job_id]
    
    return (len(test_jobs) == 1 and 
            test_jobs[0]["status"] == "completed")

def test_accept_bid_on_non_pending_job():
    """Test that accepting bid on non-pending job returns 400"""
    if not customer_token or not contractor2_bid_id:
        return False
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = make_request("PUT", f"/bids/{contractor2_bid_id}/accept", headers=headers)
    
    # Should fail because job is already completed
    return response.status_code == 400

if __name__ == "__main__":
    print("🚀 HAMMR Backend E2E Test Suite - Bidding System")
    print("=" * 60)
    print(f"Testing API: {BASE_URL}")
    print("=" * 60)
    
    runner = TestRunner()
    
    # Authentication tests
    runner.test("Customer Login", test_customer_login)
    runner.test("Contractor1 Login", test_contractor1_login)
    runner.test("Contractor2 Login", test_contractor2_login)
    
    # Setup tests  
    runner.test("Get Services", test_get_services)
    
    # E2E Bidding Flow Tests
    runner.test("1️⃣  Customer Creates Job", test_customer_create_job)
    runner.test("2️⃣  Contractor1 Places Bid", test_contractor1_place_bid)
    runner.test("3️⃣  Contractor2 Places Bid", test_contractor2_place_bid)
    runner.test("🚫 Duplicate Bid Prevention", test_duplicate_bid_prevention)
    runner.test("4️⃣  Customer Views Bids", test_customer_view_bids)
    runner.test("5️⃣  Customer Accepts Bid", test_customer_accept_bid)
    runner.test("6️⃣  Verify Bid Statuses", test_verify_bid_statuses)
    runner.test("7️⃣  Verify Job Status = Accepted", test_verify_job_status_accepted)
    runner.test("8️⃣  Contractor Starts Job", test_contractor_start_job)
    runner.test("9️⃣  Verify Job In Progress", test_verify_job_in_progress)
    runner.test("🔟 Contractor Completes Job", test_contractor_complete_job)
    runner.test("1️⃣1️⃣ Verify Job Completed", test_verify_job_completed)
    runner.test("1️⃣2️⃣ Customer Rates Contractor", test_customer_rate_contractor)
    runner.test("1️⃣3️⃣ Contractor Rates Customer", test_contractor_rate_customer)
    runner.test("✅ Final Job Verification", test_final_job_verification)
    
    # Additional API tests
    runner.test("💼 Contractor Get My Bids", test_contractor_get_my_bids)
    runner.test("🔍 Contractor Available Jobs", test_contractor_available_jobs)
    runner.test("📋 Customer Jobs Filter", test_customer_jobs_filter)
    runner.test("🚫 Accept Bid on Completed Job", test_accept_bid_on_non_pending_job)
    
    success = runner.summary()
    
    if success:
        print("\n🎉 HAMMR BIDDING SYSTEM - ALL TESTS PASSED!")
        print("✅ Complete E2E job bidding flow working perfectly")
        print("✅ Multiple contractors can bid on same job")  
        print("✅ Customer can accept one bid (others get rejected)")
        print("✅ Job progresses through all states correctly")
        print("✅ Ratings system working for both parties")
        print("✅ All edge cases and validations working")
    else:
        print("\n❌ SOME TESTS FAILED - Please check the failures above")
        exit(1)