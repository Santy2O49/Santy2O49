# Skillconnect LLC - CDL Driver Recruiting Landing Page

## Original Problem Statement
Build a landing page for a CDL driver recruiter (Skillconnect LLC) that works with 30+ trucking companies across the USA, similar to classarecruitinginc.com.

## User Requirements
- **Company Name**: Skillconnect LLC
- **Features**: All features (driver application form, partner showcase, job listings, benefits/compensation)
- **Contact**: Phone (479) 977-6813, Email skillconnect.recruiting@gmail.com
- **Quick App Link**: https://intelliapp.driverapponline.com/m/skillconnect
- **Design**: Professional & corporate (dark blues, grays)
- **Region**: Nationwide coverage, no specific company names displayed

## Target Audience
- CDL truck drivers looking for employment opportunities across the USA
- Drivers seeking competitive pay, benefits, and flexible routes

## Core Requirements (Static)
1. Professional dark-themed landing page
2. Lead capture form for driver applications
3. Job listings from database
4. Benefits/Why Choose Us section
5. Partner companies showcase (anonymous)
6. Contact information prominently displayed
7. Integration with IntelliApp for full applications

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI with MongoDB
- **Design System**: Dark slate theme, Oswald/Manrope fonts, blue/amber accents

## What's Been Implemented (December 2025)
- ✅ Sticky header with navigation and Quick Apply CTA
- ✅ Hero section with background image, CTAs
- ✅ Partners marquee (animated, 12 anonymous companies)
- ✅ Benefits section (4-card bento grid)
- ✅ Job listings section (6 positions from API)
- ✅ Lead capture form with validation
- ✅ Footer with contact info and links
- ✅ Mobile responsive design
- ✅ Backend APIs: /api/jobs, /api/leads, /api/jobs/seed

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | List all active jobs |
| GET | /api/jobs/{id} | Get single job |
| POST | /api/jobs/seed | Seed initial job data |
| POST | /api/leads | Submit driver lead |
| GET | /api/leads | List all leads |

## Prioritized Backlog

### P0 (Completed)
- [x] Landing page with all sections
- [x] Lead capture functionality
- [x] Job listings display
- [x] Mobile responsive design

### P1 (Future Enhancements)
- [ ] Admin dashboard for managing leads
- [ ] Email notifications for new leads
- [ ] Job filtering/search functionality
- [ ] Testimonials section with real driver quotes

### P2 (Nice to Have)
- [ ] Live chat integration
- [ ] SMS notifications
- [ ] Blog/Resources section
- [ ] CDL requirements calculator

## Next Tasks
1. Add email notification system for new lead submissions
2. Create admin dashboard to view/manage leads
3. Add more job listings management features
