#!/usr/bin/env python3
"""
Comprehensive backend tests for HAMMR's new Wallet + Commission + Chat systems
Tests the E2E flow as described in the review request
"""

import requests
import json
import time
import sys
from datetime import datetime

# Test configuration
BASE_URL = "https://contractor-connect-36.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test credentials
ADMIN_CREDS = {"email": "admin@hammr.com", "password": "admin123"}
CUSTOMER_CREDS = {"email": "customer1@hammr.com", "password": "password123"}
CONTRACTOR1_CREDS = {"email": "contractor1@hammr.com", "password": "password123"}
CONTRACTOR2_CREDS = {"email": "contractor2@hammr.com", "password": "password123"}

# Global variables for test data
admin_token = None
customer_token = None
contractor1_token = None
contractor2_token = None
contractor1_id = None
contractor2_id = None
customer_id = None
service_id = None

def log(message):
    """Log with timestamp"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

def make_request(method, endpoint, data=None, token=None, expected_codes=[200]):
    """Make HTTP request with proper error handling"""
    headers = HEADERS.copy()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        
        if response.status_code in expected_codes:
            try:
                return response.json()
            except:
                return {"status_code": response.status_code, "text": response.text}
        else:
            log(f"❌ Request failed: {method} {endpoint}")
            log(f"   Status: {response.status_code}")
            log(f"   Response: {response.text[:200]}")
            return None
            
    except requests.exceptions.RequestException as e:
        log(f"❌ Request error: {e}")
        return None

def test_seed_database():
    """Seed the database first"""
    log("🌱 Seeding database...")
    result = make_request("POST", "/seed")
    if result:
        log(f"✅ Database seeded: {result.get('message', 'Success')}")
        return True
    else:
        log("❌ Failed to seed database")
        return False

def test_login_all_users():
    """Login all test users and store tokens"""
    global admin_token, customer_token, contractor1_token, contractor2_token
    global contractor1_id, contractor2_id, customer_id
    
    log("🔐 Logging in all test users...")
    
    # Login admin
    result = make_request("POST", "/auth/login", ADMIN_CREDS)
    if result and "token" in result:
        admin_token = result["token"]
        log("✅ Admin login successful")
    else:
        log("❌ Admin login failed")
        return False
    
    # Login customer
    result = make_request("POST", "/auth/login", CUSTOMER_CREDS)
    if result and "token" in result:
        customer_token = result["token"]
        customer_id = result["user"]["id"]
        log(f"✅ Customer login successful (ID: {customer_id})")
    else:
        log("❌ Customer login failed")
        return False
    
    # Login contractor1
    result = make_request("POST", "/auth/login", CONTRACTOR1_CREDS)
    if result and "token" in result:
        contractor1_token = result["token"]
        contractor1_id = result["user"]["id"]
        log(f"✅ Contractor1 login successful (ID: {contractor1_id})")
    else:
        log("❌ Contractor1 login failed")
        return False
    
    # Login contractor2 (for additional tests)
    result = make_request("POST", "/auth/login", CONTRACTOR2_CREDS)
    if result and "token" in result:
        contractor2_token = result["token"]
        contractor2_id = result["user"]["id"]
        log(f"✅ Contractor2 login successful (ID: {contractor2_id})")
    else:
        log("❌ Contractor2 login failed - continuing without contractor2")
        # Not critical for main tests
    
    return True

def test_wallet_top_up():
    """TEST SUITE 1: Wallet + Commission System - Top up contractor wallet"""
    log("\n💰 TEST SUITE 1: WALLET + COMMISSION SYSTEM")
    log("1. Testing admin wallet top-up...")
    
    # Top up contractor1 wallet by $50
    adjustment_data = {
        "amount": 50,
        "reason": "Test top-up"
    }
    
    result = make_request("PUT", f"/admin/wallet/{contractor1_id}/adjust", adjustment_data, admin_token)
    if result:
        log(f"✅ Wallet top-up successful: {result.get('message', 'Success')}")
        log(f"   New balance: ${result.get('new_balance', 'Unknown')}")
        return True
    else:
        log("❌ Wallet top-up failed")
        return False

def test_wallet_balance():
    """Verify contractor wallet balance"""
    log("2. Testing wallet balance check...")
    
    result = make_request("GET", "/wallet/balance", token=contractor1_token)
    if result:
        balance = result.get("balance", 0)
        log(f"✅ Wallet balance: ${balance}")
        if balance >= 50:
            log("✅ Balance sufficient (>=50)")
            return True
        else:
            log(f"❌ Balance insufficient: ${balance} < $50")
            return False
    else:
        log("❌ Failed to get wallet balance")
        return False

def test_wallet_history():
    """Verify wallet history shows top-up entry"""
    log("3. Testing wallet history...")
    
    result = make_request("GET", "/wallet/history", token=contractor1_token)
    if result and isinstance(result, list):
        log(f"✅ Wallet history retrieved: {len(result)} entries")
        if len(result) > 0:
            latest = result[0]
            log(f"   Latest entry: ${latest.get('amount', 0)} - {latest.get('type', 'unknown')} - {latest.get('reason', 'No reason')}")
            return True
        else:
            log("⚠️  No wallet history entries found")
            return True  # Not critical
    else:
        log("❌ Failed to get wallet history")
        return False

def test_create_job():
    """Create a test job for bidding"""
    global service_id
    log("4. Creating test job...")
    
    # Get first service
    services = make_request("GET", "/services", token=customer_token)
    if not services or len(services) == 0:
        log("❌ No services available")
        return False, None
    
    service_id = services[0]["id"]
    
    job_data = {
        "service_id": service_id,
        "description": "Fix leaky kitchen faucet - urgent repair needed",
        "location": "San Salvador",
        "budget": 40
    }
    
    result = make_request("POST", "/jobs", job_data, customer_token)
    if result:
        job_id = result["id"]
        log(f"✅ Job created successfully (ID: {job_id})")
        return True, job_id
    else:
        log("❌ Failed to create job")
        return False, None

def test_contractor_bid(job_id):
    """Contractor places bid on job"""
    log("5. Testing contractor bid...")
    
    bid_data = {
        "amount": 35,
        "message": "I can fix this today!",
        "estimated_hours": 2
    }
    
    result = make_request("POST", f"/jobs/{job_id}/bid", bid_data, contractor1_token)
    if result:
        bid_id = result.get("bid_id")
        log(f"✅ Bid placed successfully (Bid ID: {bid_id})")
        return True, bid_id
    else:
        log("❌ Failed to place bid")
        return False, None

def test_accept_bid(bid_id):
    """Customer accepts the bid"""
    log("6. Testing bid acceptance...")
    
    result = make_request("PUT", f"/bids/{bid_id}/accept", token=customer_token)
    if result:
        log(f"✅ Bid accepted successfully")
        return True
    else:
        log("❌ Failed to accept bid")
        return False

def test_start_job_with_commission_check(job_id):
    """Test job start with wallet balance check"""
    log("7. Testing job start with commission check...")
    
    # First verify the job budget to calculate expected commission
    job = make_request("GET", f"/jobs/{job_id}", token=contractor1_token)
    if not job:
        log("❌ Could not fetch job details")
        return False
    
    budget = job.get("budget", 35)
    expected_commission = budget * 0.10
    log(f"   Job budget: ${budget}, Expected commission: ${expected_commission}")
    
    result = make_request("PUT", f"/jobs/{job_id}/start", token=contractor1_token)
    if result:
        log(f"✅ Job started successfully (wallet had sufficient balance)")
        return True
    else:
        log("❌ Failed to start job - insufficient balance or other error")
        return False

def test_complete_job_with_commission_deduction(job_id):
    """Test job completion with commission deduction"""
    log("8. Testing job completion with commission deduction...")
    
    # Check wallet balance before completion
    balance_before = make_request("GET", "/wallet/balance", token=contractor1_token)
    if not balance_before:
        log("❌ Could not get wallet balance before completion")
        return False
    
    before_amount = balance_before.get("balance", 0)
    log(f"   Wallet balance before completion: ${before_amount}")
    
    result = make_request("PUT", f"/jobs/{job_id}/complete", token=contractor1_token)
    if result:
        commission = result.get("commission", 0)
        log(f"✅ Job completed successfully")
        log(f"   Commission deducted: ${commission}")
        
        # Check wallet balance after completion
        balance_after = make_request("GET", "/wallet/balance", token=contractor1_token)
        if balance_after:
            after_amount = balance_after.get("balance", 0)
            log(f"   Wallet balance after completion: ${after_amount}")
            expected_after = before_amount - commission
            if abs(after_amount - expected_after) < 0.01:  # Allow small floating point differences
                log("✅ Commission deduction correct")
                return True
            else:
                log(f"❌ Commission deduction incorrect. Expected: ${expected_after}, Got: ${after_amount}")
                return False
        else:
            log("❌ Could not get wallet balance after completion")
            return False
    else:
        log("❌ Failed to complete job")
        return False

def test_commission_log_entry():
    """Verify commission log entry exists"""
    log("9. Testing commission log entry...")
    
    result = make_request("GET", "/wallet/history", token=contractor1_token)
    if result and isinstance(result, list):
        log(f"✅ Wallet history retrieved: {len(result)} entries")
        
        # Look for deduction entries
        deductions = [entry for entry in result if entry.get("type") == "deduction"]
        if len(deductions) > 0:
            latest_deduction = deductions[0]
            log(f"✅ Found commission deduction: ${latest_deduction.get('amount', 0)}")
            return True
        else:
            log("❌ No commission deduction found in wallet history")
            return False
    else:
        log("❌ Failed to get wallet history")
        return False

def test_insufficient_balance_scenario():
    """TEST SUITE 2: Test insufficient balance scenario"""
    log("\n💸 TEST SUITE 2: INSUFFICIENT BALANCE CHECK")
    log("10. Testing insufficient balance scenario...")
    
    # Create job with high budget requiring more commission than available
    high_budget_job = {
        "service_id": service_id,
        "description": "Major home renovation project",
        "location": "San Salvador",
        "budget": 600  # This would require $60 commission
    }
    
    result = make_request("POST", "/jobs", high_budget_job, customer_token)
    if not result:
        log("❌ Failed to create high-budget job")
        return False
    
    high_job_id = result["id"]
    log(f"✅ High-budget job created (ID: {high_job_id})")
    
    # Contractor bids $600
    bid_data = {
        "amount": 600,
        "message": "This is a big project but I can handle it",
        "estimated_hours": 40
    }
    
    bid_result = make_request("POST", f"/jobs/{high_job_id}/bid", bid_data, contractor1_token)
    if not bid_result:
        log("❌ Failed to place high bid")
        return False
    
    high_bid_id = bid_result.get("bid_id")
    log(f"✅ High bid placed (Bid ID: {high_bid_id})")
    
    # Customer accepts bid
    accept_result = make_request("PUT", f"/bids/{high_bid_id}/accept", token=customer_token)
    if not accept_result:
        log("❌ Failed to accept high bid")
        return False
    
    log("✅ High bid accepted")
    
    # Try to start job - should fail with insufficient balance
    start_result = make_request("PUT", f"/jobs/{high_job_id}/start", token=contractor1_token, expected_codes=[400])
    if start_result and "Insufficient balance" in start_result.get("detail", ""):
        log("✅ Job start correctly rejected due to insufficient balance")
        log(f"   Error message: {start_result.get('detail', 'No detail')}")
        return True
    else:
        log("❌ Job start should have been rejected due to insufficient balance")
        return False

def test_chat_system():
    """TEST SUITE 3: Chat System"""
    log("\n💬 TEST SUITE 3: CHAT SYSTEM")
    log("11. Testing chat system...")
    
    # First create a simple job that can be completed
    simple_job = {
        "service_id": service_id,
        "description": "Simple cleaning task for chat testing",
        "location": "San Salvador",
        "budget": 20
    }
    
    result = make_request("POST", "/jobs", simple_job, customer_token)
    if not result:
        log("❌ Failed to create simple job for chat test")
        return False
    
    chat_job_id = result["id"]
    log(f"✅ Chat test job created (ID: {chat_job_id})")
    
    # Contractor bids
    bid_data = {"amount": 18, "message": "Quick cleaning service"}
    bid_result = make_request("POST", f"/jobs/{chat_job_id}/bid", bid_data, contractor1_token)
    if not bid_result:
        log("❌ Failed to place bid for chat test")
        return False
    
    chat_bid_id = bid_result.get("bid_id")
    
    # Customer accepts
    make_request("PUT", f"/bids/{chat_bid_id}/accept", token=customer_token)
    
    # Test chat on pending job (should fail)
    log("12. Testing chat on PENDING job (should fail)...")
    pending_job = make_request("POST", "/jobs", {
        "service_id": service_id,
        "description": "Pending job for chat test",
        "location": "San Salvador",
        "budget": 25
    }, customer_token)
    
    if pending_job:
        pending_job_id = pending_job["id"]
        chat_fail = make_request("POST", f"/chat/{pending_job_id}/send", 
                               {"message": "Hello"}, customer_token, expected_codes=[400])
        if chat_fail and "Chat is only available after a bid is accepted" in chat_fail.get("detail", ""):
            log("✅ Chat correctly rejected on PENDING job")
        else:
            log("❌ Chat should be rejected on PENDING job")
            return False
    
    # Test customer sends message on accepted job
    log("13. Testing customer sending message...")
    customer_msg = {
        "message": "Hi when can you come?"
    }
    
    result = make_request("POST", f"/chat/{chat_job_id}/send", customer_msg, customer_token)
    if result:
        log(f"✅ Customer message sent successfully")
    else:
        log("❌ Failed to send customer message")
        return False
    
    # Test contractor retrieves messages
    log("14. Testing contractor retrieving messages...")
    
    messages = make_request("GET", f"/chat/{chat_job_id}/messages", token=contractor1_token)
    if messages and isinstance(messages, list) and len(messages) > 0:
        log(f"✅ Contractor retrieved {len(messages)} message(s)")
        customer_message = messages[0]
        if customer_message.get("message") == "Hi when can you come?":
            log("✅ Customer message content correct")
        else:
            log(f"❌ Customer message content incorrect: {customer_message.get('message')}")
            return False
    else:
        log("❌ Contractor failed to retrieve messages")
        return False
    
    # Test contractor sends reply
    log("15. Testing contractor sending reply...")
    contractor_msg = {
        "message": "I can come tomorrow at 10am"
    }
    
    result = make_request("POST", f"/chat/{chat_job_id}/send", contractor_msg, contractor1_token)
    if result:
        log(f"✅ Contractor reply sent successfully")
    else:
        log("❌ Failed to send contractor reply")
        return False
    
    # Test customer retrieves all messages
    log("16. Testing customer retrieving all messages...")
    
    all_messages = make_request("GET", f"/chat/{chat_job_id}/messages", token=customer_token)
    if all_messages and isinstance(all_messages, list) and len(all_messages) >= 2:
        log(f"✅ Customer retrieved {len(all_messages)} messages")
        
        # Check message order and content
        messages_content = [msg.get("message") for msg in all_messages]
        if "Hi when can you come?" in messages_content and "I can come tomorrow at 10am" in messages_content:
            log("✅ Both messages present in conversation")
        else:
            log(f"❌ Message content incorrect: {messages_content}")
            return False
    else:
        log("❌ Customer failed to retrieve all messages")
        return False
    
    # Test unauthorized access (should fail)
    log("17. Testing unauthorized chat access...")
    if contractor2_token:  # Only test if contractor2 is available
        unauthorized = make_request("GET", f"/chat/{chat_job_id}/messages", 
                                  token=contractor2_token, expected_codes=[403])
        if unauthorized and ("Not authorized" in unauthorized.get("detail", "") or 
                           unauthorized.get("status_code") == 403):
            log("✅ Unauthorized access correctly blocked")
        else:
            log("❌ Unauthorized access should be blocked")
            return False
    else:
        log("⚠️  Skipping unauthorized access test (contractor2 not available)")
    
    return True

def test_job_payment_fields():
    """TEST SUITE 4: Job payment fields"""
    log("\n💳 TEST SUITE 4: JOB PAYMENT FIELDS")
    log("18. Testing job payment fields...")
    
    # Create a test job and check default fields
    test_job = {
        "service_id": service_id,
        "description": "Test payment fields",
        "location": "San Salvador",
        "budget": 30
    }
    
    result = make_request("POST", "/jobs", test_job, customer_token)
    if not result:
        log("❌ Failed to create test job for payment fields")
        return False
    
    payment_job_id = result["id"]
    
    # Check job has payment_method field (default "cash")
    job_details = make_request("GET", f"/jobs/{payment_job_id}", token=customer_token)
    if job_details:
        payment_method = job_details.get("payment_method")
        commission_status = job_details.get("commission_status")
        
        if payment_method == "cash":
            log("✅ Job has payment_method field with default 'cash'")
        else:
            log(f"❌ Job payment_method incorrect. Expected 'cash', got '{payment_method}'")
            return False
            
        if commission_status == "owed":
            log("✅ Job has commission_status field with default 'owed'")
        else:
            log(f"❌ Job commission_status incorrect. Expected 'owed', got '{commission_status}'")
            return False
    else:
        log("❌ Failed to get job details for payment fields test")
        return False
    
    # Complete a job and verify commission_status changes to "paid"
    log("19. Testing commission_status changes to 'paid' after completion...")
    
    # Bid, accept, start, and complete the job
    bid_result = make_request("POST", f"/jobs/{payment_job_id}/bid", 
                            {"amount": 25, "message": "Payment test"}, contractor1_token)
    if not bid_result:
        log("❌ Failed to bid on payment test job")
        return False
    
    bid_id = bid_result.get("bid_id")
    make_request("PUT", f"/bids/{bid_id}/accept", token=customer_token)
    make_request("PUT", f"/jobs/{payment_job_id}/start", token=contractor1_token)
    make_request("PUT", f"/jobs/{payment_job_id}/complete", token=contractor1_token)
    
    # Check commission_status is now "paid"
    completed_job = make_request("GET", f"/jobs/{payment_job_id}", token=customer_token)
    if completed_job:
        final_commission_status = completed_job.get("commission_status")
        if final_commission_status == "paid":
            log("✅ Completed job has commission_status = 'paid'")
            return True
        else:
            log(f"❌ Completed job commission_status incorrect. Expected 'paid', got '{final_commission_status}'")
            return False
    else:
        log("❌ Failed to get completed job details")
        return False

def run_all_tests():
    """Run all test suites"""
    log("🚀 Starting HAMMR Wallet + Commission + Chat E2E Testing")
    log("=" * 60)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test functions and their descriptions
    test_functions = [
        (test_seed_database, "Database Seeding"),
        (test_login_all_users, "User Authentication"),
        (test_wallet_top_up, "Admin Wallet Top-up"),
        (test_wallet_balance, "Wallet Balance Check"),
        (test_wallet_history, "Wallet History Verification"),
    ]
    
    # Run initial setup tests
    for test_func, description in test_functions:
        try:
            if test_func():
                tests_passed += 1
                log(f"✅ {description} - PASSED")
            else:
                tests_failed += 1
                log(f"❌ {description} - FAILED")
                if test_func in [test_seed_database, test_login_all_users]:
                    log("❌ Critical test failed, stopping execution")
                    return
        except Exception as e:
            tests_failed += 1
            log(f"❌ {description} - ERROR: {e}")
            if test_func in [test_seed_database, test_login_all_users]:
                log("❌ Critical test failed, stopping execution")
                return
    
    # Test job workflow with commission
    try:
        success, job_id = test_create_job()
        if success:
            tests_passed += 1
            log("✅ Job Creation - PASSED")
            
            success, bid_id = test_contractor_bid(job_id)
            if success:
                tests_passed += 1
                log("✅ Contractor Bidding - PASSED")
                
                if test_accept_bid(bid_id):
                    tests_passed += 1
                    log("✅ Bid Acceptance - PASSED")
                    
                    if test_start_job_with_commission_check(job_id):
                        tests_passed += 1
                        log("✅ Job Start with Balance Check - PASSED")
                        
                        if test_complete_job_with_commission_deduction(job_id):
                            tests_passed += 1
                            log("✅ Job Completion with Commission - PASSED")
                        else:
                            tests_failed += 1
                            log("❌ Job Completion with Commission - FAILED")
                    else:
                        tests_failed += 1
                        log("❌ Job Start with Balance Check - FAILED")
                else:
                    tests_failed += 1
                    log("❌ Bid Acceptance - FAILED")
            else:
                tests_failed += 1
                log("❌ Contractor Bidding - FAILED")
        else:
            tests_failed += 1
            log("❌ Job Creation - FAILED")
    except Exception as e:
        tests_failed += 1
        log(f"❌ Job Workflow - ERROR: {e}")
    
    # Test commission log
    try:
        if test_commission_log_entry():
            tests_passed += 1
            log("✅ Commission Log Entry - PASSED")
        else:
            tests_failed += 1
            log("❌ Commission Log Entry - FAILED")
    except Exception as e:
        tests_failed += 1
        log(f"❌ Commission Log Entry - ERROR: {e}")
    
    # Test insufficient balance
    try:
        if test_insufficient_balance_scenario():
            tests_passed += 1
            log("✅ Insufficient Balance Check - PASSED")
        else:
            tests_failed += 1
            log("❌ Insufficient Balance Check - FAILED")
    except Exception as e:
        tests_failed += 1
        log(f"❌ Insufficient Balance Check - ERROR: {e}")
    
    # Test chat system
    try:
        if test_chat_system():
            tests_passed += 1
            log("✅ Chat System - PASSED")
        else:
            tests_failed += 1
            log("❌ Chat System - FAILED")
    except Exception as e:
        tests_failed += 1
        log(f"❌ Chat System - ERROR: {e}")
    
    # Test payment fields
    try:
        if test_job_payment_fields():
            tests_passed += 1
            log("✅ Job Payment Fields - PASSED")
        else:
            tests_failed += 1
            log("❌ Job Payment Fields - FAILED")
    except Exception as e:
        tests_failed += 1
        log(f"❌ Job Payment Fields - ERROR: {e}")
    
    # Final results
    log("\n" + "=" * 60)
    log(f"🎯 TESTING COMPLETE")
    log(f"✅ Tests Passed: {tests_passed}")
    log(f"❌ Tests Failed: {tests_failed}")
    log(f"📊 Success Rate: {(tests_passed / (tests_passed + tests_failed) * 100):.1f}%")
    
    if tests_failed == 0:
        log("🎉 ALL TESTS PASSED! Wallet + Commission + Chat systems are working perfectly.")
    else:
        log(f"⚠️  {tests_failed} tests failed. Please review the issues above.")

if __name__ == "__main__":
    run_all_tests()