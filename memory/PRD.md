# HAMMR - PRD (Product Requirements Document)

## Problem Statement
HAMMR is an "Uber for home services" platform for El Salvador. Three interconnected apps:
1. **Customer App** - Find, request, and pay for home services
2. **Contractor App** - Find and accept service jobs
3. **Admin App** - Manage users, orders, routes, finances

## Tech Stack
- **Frontend:** Expo SDK 54 (React Native), Expo Router, Zustand, i18n-js
- **Backend:** FastAPI (Python), MongoDB (motor async driver)
- **Architecture:** Monorepo, three-role system via Expo route groups

## E2E Job Flow (COMPLETE)
User → Post Job → Contractor → Bid → User → Accept Bid → Job Started → Completed → Rating Given

## What's Been Implemented

### Authentication & Roles
- [x] Login/Logout for all three roles
- [x] JWT token-based auth, secret admin access (5-tap trigger)

### Customer App
- [x] Dark/Light theme switching (Zustand store)
- [x] Custom sidebar drawer (hamburger menu)
- [x] Platform-specific map (OSM iframe web, react-native-maps native)
- [x] Service request with 25% price reduction + manual entry
- [x] Jobs list with bid count, "View Bids" button, bids modal
- [x] Accept bid flow — assigns contractor, rejects other bids
- [x] Star rating after job completion
- [x] Profile, Settings, Help screens

### Contractor App
- [x] Available jobs with "Place Bid" button + bid modal (amount + message)
- [x] My Jobs with Start/Complete lifecycle buttons
- [x] Bid count shown per job, earnings calculation (after commission)
- [x] Earnings dashboard, profile

### Bidding System (NEW)
- [x] POST /api/jobs/{job_id}/bid - Place bid with amount + message
- [x] GET /api/jobs/{job_id}/bids - View all bids for a job
- [x] PUT /api/bids/{bid_id}/accept - Accept bid, reject others, assign contractor
- [x] GET /api/bids/my - Contractor's own bids
- [x] Duplicate bid prevention, status management (pending/accepted/rejected)

### Admin App
- [x] Dashboard, User management, Jobs monitoring, Finance overview

### Backend
- [x] Full CRUD for users, services, jobs, bids
- [x] Job lifecycle: pending → accepted → in_progress → completed
- [x] Commission calculation (10%), rating system (mutual)

## Credentials
- Customer: customer1@hammr.com / password123
- Contractor: contractor1@hammr.com / password123
- Admin: admin@hammr.com / admin123

## Backlog
### P1
- Admin sidebar navigation for web/tablet
- Real-time push notifications
### P2
- Payment integration (Stripe)
- Chat between customer and contractor
- Contractor app dark/light theme
### P3
- Scheduling system, live location tracking
- Admin analytics dashboard
