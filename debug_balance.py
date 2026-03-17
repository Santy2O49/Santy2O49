#!/usr/bin/env python3
"""
Debug script to investigate the insufficient balance check issue
"""

import requests
import json

BASE_URL = "https://contractor-connect-36.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Login contractor1
login_result = requests.post(f"{BASE_URL}/auth/login", 
                           json={"email": "contractor1@hammr.com", "password": "password123"}, 
                           headers=HEADERS)
if login_result.status_code == 200:
    contractor1_token = login_result.json()["token"]
    contractor1_id = login_result.json()["user"]["id"]
    print(f"Contractor1 ID: {contractor1_id}")
    
    # Check current wallet balance
    balance_response = requests.get(f"{BASE_URL}/wallet/balance", 
                                  headers={**HEADERS, "Authorization": f"Bearer {contractor1_token}"})
    if balance_response.status_code == 200:
        balance = balance_response.json()["balance"]
        print(f"Current wallet balance: ${balance}")
        
        # Check if there are any jobs with $600 budget that might be affecting this
        jobs_response = requests.get(f"{BASE_URL}/jobs", 
                                   headers={**HEADERS, "Authorization": f"Bearer {contractor1_token}"})
        if jobs_response.status_code == 200:
            jobs = jobs_response.json()
            high_budget_jobs = [job for job in jobs if job.get("budget", 0) >= 600]
            print(f"High budget jobs (>=600): {len(high_budget_jobs)}")
            for job in high_budget_jobs:
                print(f"  Job {job['id']}: ${job['budget']} - Status: {job['status']}")
                required_commission = job['budget'] * 0.10
                print(f"    Required commission: ${required_commission}")
                print(f"    Can afford? ${balance >= required_commission}")
else:
    print("Failed to login")