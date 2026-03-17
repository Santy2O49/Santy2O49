# HAMMR - PRD (Product Requirements Document)

## Problem Statement
HAMMR is an "Uber for home services" cash-based marketplace for El Salvador. Three apps:
1. **Customer App** - Find, request, and pay for services (cash/bank transfer)
2. **Contractor App** - Find jobs, bid, earn money
3. **Admin App** - Manage users, wallets, commissions, jobs

## Tech Stack
- **Frontend:** Expo SDK 54 (React Native), Expo Router, Zustand, i18n-js
- **Backend:** FastAPI (Python), MongoDB (motor async driver)
- **Payments:** Local-first, cash-based. NO Stripe/external processors.

## E2E Flow (COMPLETE)
User → Post Job → Contractor → Bid → User → Accept Bid → Chat Opens → Contractor Starts (wallet check) → Completes (commission deducted) → Rating Given

## Wallet + Commission System
- Contractors have `wallet_balance` for prepaid commission credits
- 10% platform commission on each completed job
- Wallet balance checked BEFORE job start (fresh DB read, not JWT)
- Commission auto-deducted on job completion
- Admin can adjust wallet balances (top-up/withdrawal)
- All transactions logged in `commission_logs` collection
- Job fields: `payment_method` (cash/bank_transfer), `commission_status` (owed/paid)

## Chat System
- Chat enabled ONLY after bid acceptance
- REST polling (3s interval) — simple & works on all platforms
- Messages stored per job_id with sender/receiver
- Access restricted to job owner + assigned contractor
- "Message Contractor/Customer" buttons in both apps

## What's Been Implemented

### Authentication & Roles
- [x] Login/Logout for all three roles, JWT auth, secret admin access

### Customer App
- [x] Dark/Light theme switching, custom sidebar drawer
- [x] Platform-specific map (OSM web, react-native-maps native)
- [x] Service request with 25% price reduction + manual entry
- [x] Jobs with bid viewing, bid acceptance, "Message Contractor" button
- [x] Chat screen (polling-based, per-job)
- [x] Star rating after completion

### Contractor App
- [x] Available jobs with "Place Bid" modal
- [x] My Jobs with wallet banner, Start/Complete buttons
- [x] Wallet balance display, commission calculations shown
- [x] "Message Customer" button + chat screen
- [x] Insufficient balance prevention with clear error

### Bidding System
- [x] POST/GET bids, accept/reject, duplicate prevention

### Admin App
- [x] Dashboard, user management, jobs monitoring
- [x] PUT /api/admin/wallet/{user_id}/adjust for wallet top-ups

### Backend APIs
- Wallet: GET /api/wallet/balance, GET /api/wallet/history
- Chat: POST /api/chat/{job_id}/send, GET /api/chat/{job_id}/messages
- Admin: PUT /api/admin/wallet/{user_id}/adjust
- All existing job/bid/auth/service endpoints

## Credentials
- Customer: customer1@hammr.com / password123
- Contractor: contractor1@hammr.com / password123 (wallet: $50)
- Admin: admin@hammr.com / admin123

## Backlog
### P1
- Admin sidebar navigation for web/tablet
- Push notifications
### P2
- Contractor app dark/light theme
- Live location tracking
- Wompi payment gateway (future, not now)
### P3
- Scheduling system
- Admin analytics dashboard
