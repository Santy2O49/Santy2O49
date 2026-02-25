# CDL Driver Recruiting Platform

## Original Problem Statement
Build a landing page for a CDL driver recruiter (Skillconnect LLC) that works with 30+ trucking companies across the USA, with admin dashboard to manage jobs, configurable site name/branding, application counter, and request for info page.

## User Requirements
- **Initial Company Name**: Skillconnect LLC (configurable via admin)
- **Features**: All features (driver application form, partner showcase, job listings, benefits/compensation)
- **Contact**: Phone (479) 977-6813, Email skillconnect.recruiting@gmail.com
- **Quick App Link**: https://intelliapp.driverapponline.com/m/skillconnect
- **Design**: Professional & corporate (dark blues, grays)
- **Region**: Nationwide coverage
- **Admin Dashboard**: Job management, lead tracking, site configuration
- **Application Counter**: Track and limit applications
- **Request Info Page**: Trucker lingo form for drivers to be contacted

## Target Audience
- CDL truck drivers looking for employment opportunities across the USA
- Recruiters managing multiple trucking company partnerships

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI with MongoDB
- **Authentication**: HTTP Basic Auth for admin routes
- **Design System**: Dark slate theme, Oswald/Manrope fonts, blue/amber accents

## What's Been Implemented (December 2025)

### Phase 1 - Landing Page
- ✅ Sticky header with navigation and Quick Apply CTA
- ✅ Hero section with background image, CTAs
- ✅ Partners marquee (animated, 12 anonymous companies)
- ✅ Benefits section (4-card bento grid)
- ✅ Job listings section (6 positions from API)
- ✅ Lead capture form with validation
- ✅ Footer with contact info and links
- ✅ Mobile responsive design

### Phase 2 - Admin & Enhanced Features
- ✅ Admin login page (/admin)
- ✅ Admin dashboard with stats (applications, leads, jobs, info requests)
- ✅ Jobs management (add, edit, activate/deactivate, delete)
- ✅ Leads management (view driver applications)
- ✅ Info Requests management (view requests for contact)
- ✅ Site Settings (configurable site name, powered by, phone, email, URLs)
- ✅ Application counter system (limit + used counter)
- ✅ Request Info page (/request-info) with trucker lingo
- ✅ Dynamic "Powered by [LLC Name]" footer

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/config | Get site configuration |
| GET | /api/jobs | List all active jobs |
| GET | /api/jobs/{id} | Get single job |
| POST | /api/jobs/seed | Seed initial job data |
| POST | /api/leads | Submit driver lead |
| POST | /api/info-requests | Submit info request |

### Admin Endpoints (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/login | Verify admin credentials |
| GET | /api/admin/stats | Get dashboard statistics |
| PUT | /api/admin/config | Update site configuration |
| POST | /api/admin/config/reset-counter | Reset application counter |
| GET | /api/admin/jobs | List all jobs (including inactive) |
| POST | /api/admin/jobs | Create new job |
| PUT | /api/admin/jobs/{id} | Update job |
| DELETE | /api/admin/jobs/{id} | Delete job |
| GET | /api/admin/leads | List all driver leads |
| PUT | /api/admin/leads/{id}/status | Update lead status |
| DELETE | /api/admin/leads/{id} | Delete lead |
| GET | /api/admin/info-requests | List all info requests |

## Admin Credentials
- **Username**: admin
- **Password**: skillconnect2024

## Domain Registration Notes
User wants to check availability for these domains on GoDaddy:
- OnlyCDLJobs.com, TopCDLJobs.com, NationwideCDLJobs.com
- CDLCareerHub.com, TruckerCareers.com, TruckingJobsHub.com
- RealCDLJobs.com, JustTruckJobs.com, CDLJobsNow.com
- FastCDLJobs.com, InstantCDLJobs.com, EasyCDLJobs.com
- onestopcdlajobs.com

Once domain is registered, update via Admin Settings:
1. Go to /admin
2. Login with admin/skillconnect2024
3. Click Settings tab
4. Update "Site Name (Domain Name)" field
5. Update "Powered By (LLC Name)" if needed
6. Click Save Settings

## Prioritized Backlog

### P0 (Completed)
- [x] Landing page with all sections
- [x] Lead capture functionality
- [x] Job listings display
- [x] Mobile responsive design
- [x] Admin dashboard with job management
- [x] Configurable site branding
- [x] Application counter system
- [x] Request for Info page

### P1 (Future Enhancements)
- [ ] Email notifications for new leads (SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Resume upload for info requests
- [ ] Job filtering/search functionality
- [ ] Custom domain DNS configuration

### P2 (Nice to Have)
- [ ] Live chat integration
- [ ] Testimonials section
- [ ] Blog/Resources section
- [ ] CDL requirements calculator
- [ ] Multiple admin users

## Next Tasks
1. Register domain on GoDaddy
2. Configure DNS to point to deployed site
3. Update site name via admin panel
4. Add email notifications for new applications
