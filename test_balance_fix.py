#!/usr/bin/env python3
"""
Test the insufficient balance fix
"""

import requests
import json

BASE_URL = "https://contractor-connect-36.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def test_insufficient_balance_fix():
    # Login admin
    admin_login = requests.post(f"{BASE_URL}/auth/login", 
                              json={"email": "admin@hammr.com", "password": "admin123"}, 
                              headers=HEADERS)
    admin_token = admin_login.json()["token"]
    
    # Login customer
    customer_login = requests.post(f"{BASE_URL}/auth/login", 
                                 json={"email": "customer1@hammr.com", "password": "password123"}, 
                                 headers=HEADERS)
    customer_token = customer_login.json()["token"]
    customer_id = customer_login.json()["user"]["id"]
    
    # Login contractor1
    contractor_login = requests.post(f"{BASE_URL}/auth/login", 
                                   json={"email": "contractor1@hammr.com", "password": "password123"}, 
                                   headers=HEADERS)
    contractor1_token = contractor_login.json()["token"]
    contractor1_id = contractor_login.json()["user"]["id"]
    
    # Check current wallet balance
    balance_response = requests.get(f"{BASE_URL}/wallet/balance", 
                                  headers={**HEADERS, "Authorization": f"Bearer {contractor1_token}"})
    current_balance = balance_response.json()["balance"]
    print(f"Current contractor wallet balance: ${current_balance}")
    
    # Get a service ID
    services = requests.get(f"{BASE_URL}/services", headers={**HEADERS, "Authorization": f"Bearer {customer_token}"})
    service_id = services.json()[0]["id"]
    
    # Create a high-budget job that requires more commission than available
    required_commission = 100.0  # We'll make this require $100 commission
    job_budget = required_commission / 0.10  # $1000 budget
    
    print(f"Creating job with ${job_budget} budget (requires ${required_commission} commission)")
    print(f"Contractor has ${current_balance} available - should be insufficient!")
    
    high_budget_job = {
        "service_id": service_id,
        "description": "Very expensive job to test insufficient balance",
        "location": "San Salvador",
        "budget": job_budget
    }
    
    job_result = requests.post(f"{BASE_URL}/jobs", json=high_budget_job, 
                             headers={**HEADERS, "Authorization": f"Bearer {customer_token}"})
    job_id = job_result.json()["id"]
    print(f"✅ Job created: {job_id}")
    
    # Contractor bids
    bid_data = {
        "amount": job_budget,
        "message": "This should fail when I try to start it"
    }
    
    bid_result = requests.post(f"{BASE_URL}/jobs/{job_id}/bid", json=bid_data,
                             headers={**HEADERS, "Authorization": f"Bearer {contractor1_token}"})
    bid_id = bid_result.json()["bid_id"]
    print(f"✅ Bid placed: {bid_id}")
    
    # Customer accepts
    accept_result = requests.put(f"{BASE_URL}/bids/{bid_id}/accept",
                               headers={**HEADERS, "Authorization": f"Bearer {customer_token}"})
    print("✅ Bid accepted")
    
    # Try to start job - should now fail!
    start_result = requests.put(f"{BASE_URL}/jobs/{job_id}/start",
                              headers={**HEADERS, "Authorization": f"Bearer {contractor1_token}"})
    
    if start_result.status_code == 400:
        error_message = start_result.json().get("detail", "")
        if "Insufficient balance" in error_message:
            print("✅ FIXED! Job start correctly rejected due to insufficient balance")
            print(f"   Error message: {error_message}")
            return True
        else:
            print(f"❌ Wrong error message: {error_message}")
            return False
    else:
        print(f"❌ Job start should have failed with 400, got {start_result.status_code}")
        print(f"   Response: {start_result.text}")
        return False

if __name__ == "__main__":
    if test_insufficient_balance_fix():
        print("\n🎉 Insufficient balance check is now working correctly!")
    else:
        print("\n❌ Insufficient balance check is still not working properly.")