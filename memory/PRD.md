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

## Core Requirements
- Multi-lingual (EN/ES) based on device settings
- Secret admin login (5-tap copyright text)
- Monetization: commissions, subscriptions, featured services
- Cross-platform (mobile + web)

## What's Been Implemented

### Authentication & Roles
- [x] Login/Logout for all three roles
- [x] Registration with role selection
- [x] JWT token-based auth
- [x] Secret admin access (5-tap trigger)
- [x] Demo quick-login buttons

### Customer App
- [x] Dark/Light theme switching (via Zustand store)
- [x] Custom sidebar drawer (hamburger menu)
- [x] Map integration (OpenStreetMap, dark/light adaptive)
- [x] Service categories & featured services list
- [x] Service request screen with price negotiation slider
- [x] Jobs list with filtering (All/Active/Completed)
- [x] Profile with edit, avatar upload, stats
- [x] Settings with theme toggle, language selection
- [x] Help & Support with contact options

### Contractor App
- [x] Job browsing & acceptance
- [x] Job lifecycle (accept → start → complete)
- [x] Earnings dashboard
- [x] Profile management

### Admin App
- [x] Dashboard with KPIs
- [x] User management (verify/block)
- [x] Jobs monitoring
- [x] Finance overview
- [x] AI pricing engine & marketing assistant

### Backend
- [x] Full CRUD for users, services, jobs
- [x] Job lifecycle management
- [x] Rating system (mutual)
- [x] Finance/earnings tracking
- [x] Database seeding
- [x] AI integrations (Gemini)

## DB Schema
- **users:** id, email, password, role, full_name, phone, rating, is_verified
- **services:** id, name, description, category, icon, base_price
- **jobs:** id, customer_id, contractor_id, service_id, status, budget, location
- **reviews:** job_id, reviewer_id, rating, comment
- **transactions:** user_id, amount, type, job_id

## Credentials
- Customer: customer1@hammr.com / password123
- Contractor: contractor1@hammr.com / password123
- Admin: admin@hammr.com / admin123

## Backlog (Prioritized)

### P1
- Admin sidebar navigation for web/tablet
- Real-time push notifications
- Price negotiation backend logic

### P2
- Payment integration (Stripe)
- Profile photo upload with object storage
- Contractor app dark/light theme
- Real-time job tracking with live location

### P3
- Chat between customer and contractor
- Scheduling system (calendar integration)
- Review & rating UI improvements
- Admin analytics dashboard
