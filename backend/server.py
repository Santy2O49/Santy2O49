from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import csv
import io
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Basic Auth for Admin
security = HTTPBasic()

# Admin credentials from environment
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'skillconnect2024')

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Site Configuration Model
class SiteConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = "site_config"
    site_name: str = "CDL Driver Career Hub"
    powered_by_name: str = "Skillconnect LLC"
    phone: str = "(479) 977-6813"
    email: str = "skillconnect.recruiting@gmail.com"
    quick_app_url: str = "https://intelliapp.driverapponline.com/m/skillconnect"
    application_limit: int = 100
    applications_used: int = 0

class SiteConfigUpdate(BaseModel):
    site_name: Optional[str] = None
    powered_by_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    quick_app_url: Optional[str] = None
    application_limit: Optional[int] = None
    applications_used: Optional[int] = None

# Lead/Driver Application Model
class DriverLeadCreate(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    cdl_experience: int
    zip_code: str
    job_id: Optional[str] = None
    job_title: Optional[str] = None

class DriverLead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone: str
    email: str
    cdl_experience: int
    zip_code: str
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request for Info Model
class InfoRequestCreate(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    preferred_contact: str = "phone"
    message: Optional[str] = None
    resume_url: Optional[str] = None

class InfoRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone: str
    email: str
    preferred_contact: str
    message: Optional[str] = None
    resume_url: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Job Listing Model
class JobListingCreate(BaseModel):
    title: str
    location: str
    pay: str
    job_type: str
    description: str
    requirements: List[str] = []
    benefits: List[str] = []
    is_active: bool = True

class JobListingUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    pay: Optional[str] = None
    job_type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    is_active: Optional[bool] = None

class JobListing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    location: str
    pay: str
    job_type: str
    description: str
    requirements: List[str]
    benefits: List[str]
    is_active: bool = True
    views: int = 0
    applications: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Job View Tracking Model
class JobView(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_hash: Optional[str] = None


# ============== PUBLIC ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "CDL Driver Recruiting API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Site Configuration (Public - Read Only)
@api_router.get("/config")
async def get_site_config():
    config = await db.site_config.find_one({"id": "site_config"}, {"_id": 0})
    if not config:
        default_config = SiteConfig()
        await db.site_config.insert_one(default_config.model_dump())
        return default_config.model_dump()
    return config

# Driver Lead Routes (Public)
@api_router.post("/leads", response_model=DriverLead)
async def submit_driver_lead(input: DriverLeadCreate):
    config = await db.site_config.find_one({"id": "site_config"}, {"_id": 0})
    if config:
        if config.get('applications_used', 0) >= config.get('application_limit', 100):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application limit reached. Please contact us directly."
            )
    
    lead_obj = DriverLead(**input.model_dump())
    
    doc = lead_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.driver_leads.insert_one(doc)
    
    # Increment applications counter
    await db.site_config.update_one(
        {"id": "site_config"},
        {"$inc": {"applications_used": 1}},
        upsert=True
    )
    
    # Increment job application count if job_id provided
    if input.job_id:
        await db.job_listings.update_one(
            {"id": input.job_id},
            {"$inc": {"applications": 1}}
        )
    
    return lead_obj

# Request for Info Routes (Public)
@api_router.post("/info-requests", response_model=InfoRequest)
async def submit_info_request(input: InfoRequestCreate):
    request_obj = InfoRequest(**input.model_dump())
    
    doc = request_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.info_requests.insert_one(doc)
    return request_obj

# Job Listings Routes (Public - Read Only)
@api_router.get("/jobs", response_model=List[JobListing])
async def get_job_listings():
    jobs = await db.job_listings.find({"is_active": True}, {"_id": 0}).to_list(100)
    for job in jobs:
        if 'created_at' in job and isinstance(job['created_at'], str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
        # Ensure views and applications fields exist
        if 'views' not in job:
            job['views'] = 0
        if 'applications' not in job:
            job['applications'] = 0
    return jobs

@api_router.get("/jobs/{job_id}", response_model=JobListing)
async def get_job_by_id(job_id: str):
    job = await db.job_listings.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if 'created_at' in job and isinstance(job['created_at'], str):
        job['created_at'] = datetime.fromisoformat(job['created_at'])
    return job

# Track job view (Public)
@api_router.post("/jobs/{job_id}/view")
async def track_job_view(job_id: str):
    # Increment view count
    result = await db.job_listings.update_one(
        {"id": job_id},
        {"$inc": {"views": 1}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Log the view
    view_doc = {
        "id": str(uuid.uuid4()),
        "job_id": job_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.job_views.insert_one(view_doc)
    
    return {"message": "View tracked"}


# ============== ADMIN ROUTES ==============

# Admin Login Check
@api_router.post("/admin/login")
async def admin_login(username: str = Depends(verify_admin)):
    return {"message": "Login successful", "username": username}

# Admin - Site Configuration
@api_router.put("/admin/config")
async def update_site_config(updates: SiteConfigUpdate, username: str = Depends(verify_admin)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    await db.site_config.update_one(
        {"id": "site_config"},
        {"$set": update_data},
        upsert=True
    )
    
    config = await db.site_config.find_one({"id": "site_config"}, {"_id": 0})
    return config

@api_router.post("/admin/config/reset-counter")
async def reset_application_counter(username: str = Depends(verify_admin)):
    await db.site_config.update_one(
        {"id": "site_config"},
        {"$set": {"applications_used": 0}},
        upsert=True
    )
    return {"message": "Application counter reset to 0"}

# Admin - Job Management
@api_router.get("/admin/jobs")
async def admin_get_all_jobs(username: str = Depends(verify_admin)):
    jobs = await db.job_listings.find({}, {"_id": 0}).to_list(100)
    for job in jobs:
        if 'created_at' in job and isinstance(job['created_at'], str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
        if 'views' not in job:
            job['views'] = 0
        if 'applications' not in job:
            job['applications'] = 0
    return jobs

@api_router.post("/admin/jobs", response_model=JobListing)
async def admin_create_job(job: JobListingCreate, username: str = Depends(verify_admin)):
    job_obj = JobListing(**job.model_dump())
    
    doc = job_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['views'] = 0
    doc['applications'] = 0
    
    await db.job_listings.insert_one(doc)
    return job_obj

@api_router.put("/admin/jobs/{job_id}", response_model=JobListing)
async def admin_update_job(job_id: str, updates: JobListingUpdate, username: str = Depends(verify_admin)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    result = await db.job_listings.update_one(
        {"id": job_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = await db.job_listings.find_one({"id": job_id}, {"_id": 0})
    if 'created_at' in job and isinstance(job['created_at'], str):
        job['created_at'] = datetime.fromisoformat(job['created_at'])
    return job

@api_router.delete("/admin/jobs/{job_id}")
async def admin_delete_job(job_id: str, username: str = Depends(verify_admin)):
    result = await db.job_listings.delete_one({"id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}

# Reset job stats
@api_router.post("/admin/jobs/{job_id}/reset-stats")
async def admin_reset_job_stats(job_id: str, username: str = Depends(verify_admin)):
    result = await db.job_listings.update_one(
        {"id": job_id},
        {"$set": {"views": 0, "applications": 0}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job stats reset"}

# Admin - Lead Management
@api_router.get("/admin/leads")
async def admin_get_leads(username: str = Depends(verify_admin)):
    leads = await db.driver_leads.find({}, {"_id": 0}).to_list(1000)
    for lead in leads:
        if 'created_at' in lead and isinstance(lead['created_at'], str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return leads

@api_router.put("/admin/leads/{lead_id}/status")
async def admin_update_lead_status(lead_id: str, new_status: str, username: str = Depends(verify_admin)):
    result = await db.driver_leads.update_one(
        {"id": lead_id},
        {"$set": {"status": new_status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": f"Lead status updated to {new_status}"}

@api_router.delete("/admin/leads/{lead_id}")
async def admin_delete_lead(lead_id: str, username: str = Depends(verify_admin)):
    result = await db.driver_leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

# Download leads as CSV
@api_router.get("/admin/leads/download")
async def admin_download_leads(username: str = Depends(verify_admin)):
    leads = await db.driver_leads.find({}, {"_id": 0}).to_list(10000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Name', 'Phone', 'Email', 'CDL Experience (Years)', 'Zip Code', 'Job Applied', 'Status', 'Date'])
    
    for lead in leads:
        writer.writerow([
            lead.get('full_name', ''),
            lead.get('phone', ''),
            lead.get('email', ''),
            lead.get('cdl_experience', ''),
            lead.get('zip_code', ''),
            lead.get('job_title', 'General Application'),
            lead.get('status', 'new'),
            lead.get('created_at', '')
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=leads_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

# Download info requests as CSV
@api_router.get("/admin/info-requests/download")
async def admin_download_info_requests(username: str = Depends(verify_admin)):
    requests = await db.info_requests.find({}, {"_id": 0}).to_list(10000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Name', 'Phone', 'Email', 'Preferred Contact', 'Message', 'Status', 'Date'])
    
    for req in requests:
        writer.writerow([
            req.get('full_name', ''),
            req.get('phone', ''),
            req.get('email', ''),
            req.get('preferred_contact', ''),
            req.get('message', ''),
            req.get('status', 'pending'),
            req.get('created_at', '')
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=info_requests_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

# Admin - Info Requests Management
@api_router.get("/admin/info-requests")
async def admin_get_info_requests(username: str = Depends(verify_admin)):
    requests = await db.info_requests.find({}, {"_id": 0}).to_list(1000)
    for req in requests:
        if 'created_at' in req and isinstance(req['created_at'], str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
    return requests

@api_router.put("/admin/info-requests/{request_id}/status")
async def admin_update_info_request_status(request_id: str, new_status: str, username: str = Depends(verify_admin)):
    result = await db.info_requests.update_one(
        {"id": request_id},
        {"$set": {"status": new_status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": f"Request status updated to {new_status}"}

# Admin - Dashboard Stats
@api_router.get("/admin/stats")
async def admin_get_stats(username: str = Depends(verify_admin)):
    config = await db.site_config.find_one({"id": "site_config"}, {"_id": 0})
    leads_count = await db.driver_leads.count_documents({})
    new_leads_count = await db.driver_leads.count_documents({"status": "new"})
    info_requests_count = await db.info_requests.count_documents({})
    pending_requests = await db.info_requests.count_documents({"status": "pending"})
    active_jobs_count = await db.job_listings.count_documents({"is_active": True})
    total_jobs_count = await db.job_listings.count_documents({})
    
    # Get total views and applications across all jobs
    pipeline = [
        {"$group": {
            "_id": None,
            "total_views": {"$sum": {"$ifNull": ["$views", 0]}},
            "total_applications": {"$sum": {"$ifNull": ["$applications", 0]}}
        }}
    ]
    totals = await db.job_listings.aggregate(pipeline).to_list(1)
    total_views = totals[0]['total_views'] if totals else 0
    total_job_applications = totals[0]['total_applications'] if totals else 0
    
    return {
        "applications_used": config.get('applications_used', 0) if config else 0,
        "application_limit": config.get('application_limit', 100) if config else 100,
        "applications_remaining": (config.get('application_limit', 100) - config.get('applications_used', 0)) if config else 100,
        "total_leads": leads_count,
        "new_leads": new_leads_count,
        "info_requests": info_requests_count,
        "pending_requests": pending_requests,
        "active_jobs": active_jobs_count,
        "total_jobs": total_jobs_count,
        "total_job_views": total_views,
        "total_job_applications": total_job_applications
    }

# Admin - Job Analytics
@api_router.get("/admin/analytics/jobs")
async def admin_get_job_analytics(username: str = Depends(verify_admin)):
    jobs = await db.job_listings.find({}, {"_id": 0, "id": 1, "title": 1, "views": 1, "applications": 1, "is_active": 1}).to_list(100)
    
    for job in jobs:
        if 'views' not in job:
            job['views'] = 0
        if 'applications' not in job:
            job['applications'] = 0
        # Calculate conversion rate
        if job['views'] > 0:
            job['conversion_rate'] = round((job['applications'] / job['views']) * 100, 1)
        else:
            job['conversion_rate'] = 0
    
    return jobs

# Seed initial data
@api_router.post("/admin/seed")
async def seed_initial_data(username: str = Depends(verify_admin)):
    existing_config = await db.site_config.find_one({"id": "site_config"})
    if not existing_config:
        default_config = SiteConfig()
        await db.site_config.insert_one(default_config.model_dump())
    
    jobs_count = await db.job_listings.count_documents({})
    if jobs_count == 0:
        jobs = [
            {
                "id": str(uuid.uuid4()),
                "title": "OTR Dry Van Driver",
                "location": "Nationwide",
                "pay": "$0.65 - $0.75 CPM",
                "job_type": "Full Time",
                "description": "Join our fleet of professional OTR drivers covering routes across the continental United States.",
                "requirements": ["Valid CDL-A", "2+ years experience", "Clean MVR", "No DUI/DWI"],
                "benefits": ["Health Insurance", "401k Match", "Paid Time Off", "Weekly Pay"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Regional Flatbed Driver",
                "location": "Midwest / Southeast",
                "pay": "$1,500 - $1,800 / week",
                "job_type": "Full Time",
                "description": "Regional flatbed positions with consistent home time. Haul construction materials and equipment.",
                "requirements": ["Valid CDL-A", "1+ year flatbed experience", "Tarping experience", "Clean record"],
                "benefits": ["Weekly Home Time", "Medical/Dental/Vision", "Bonus Programs", "Modern Equipment"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Dedicated Lane - TX to CA",
                "location": "Texas to California",
                "pay": "$1,600 Guaranteed Weekly",
                "job_type": "Contract",
                "description": "Dedicated lane running from Texas to California. Consistent freight, predictable schedule.",
                "requirements": ["Valid CDL-A", "6+ months experience", "TWIC Card preferred", "Doubles endorsement a plus"],
                "benefits": ["Guaranteed Pay", "Fuel Cards", "Rider Program", "Pet Friendly"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Local P&D Driver",
                "location": "Major Metro Areas",
                "pay": "$22 - $28 / hour",
                "job_type": "Full Time",
                "description": "Local pickup and delivery positions in major metropolitan areas. Home daily.",
                "requirements": ["Valid CDL-A", "1+ year experience", "Touch freight capability", "Customer service skills"],
                "benefits": ["Home Daily", "Overtime Available", "Benefits Day 1", "Union Position"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Team Drivers - Coast to Coast",
                "location": "Nationwide",
                "pay": "$0.70 - $0.80 CPM Split",
                "job_type": "Full Time",
                "description": "Team driving positions for coast-to-coast expedited freight. High miles, high pay.",
                "requirements": ["Valid CDL-A", "Team experience preferred", "Hazmat endorsement", "Clean background"],
                "benefits": ["Top Miles", "Sign-on Bonus", "Referral Bonus", "Quarterly Safety Bonus"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Reefer Driver - Southeast Regional",
                "location": "Southeast Region",
                "pay": "$1,400 - $1,700 / week",
                "job_type": "Full Time",
                "description": "Temperature-controlled freight throughout the Southeast. Quality equipment and great lanes.",
                "requirements": ["Valid CDL-A", "Reefer experience", "Food-grade hauling knowledge", "Temp management skills"],
                "benefits": ["New Equipment", "Weekly Home Time", "Direct Deposit", "Rider Policy"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.job_listings.insert_many(jobs)
    
    return {"message": "Initial data seeded successfully"}

# Public seed (for initial load)
@api_router.post("/jobs/seed")
async def seed_job_listings():
    jobs_count = await db.job_listings.count_documents({})
    if jobs_count == 0:
        jobs = [
            {
                "id": str(uuid.uuid4()),
                "title": "OTR Dry Van Driver",
                "location": "Nationwide",
                "pay": "$0.65 - $0.75 CPM",
                "job_type": "Full Time",
                "description": "Join our fleet of professional OTR drivers covering routes across the continental United States.",
                "requirements": ["Valid CDL-A", "2+ years experience", "Clean MVR", "No DUI/DWI"],
                "benefits": ["Health Insurance", "401k Match", "Paid Time Off", "Weekly Pay"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Regional Flatbed Driver",
                "location": "Midwest / Southeast",
                "pay": "$1,500 - $1,800 / week",
                "job_type": "Full Time",
                "description": "Regional flatbed positions with consistent home time. Haul construction materials and equipment.",
                "requirements": ["Valid CDL-A", "1+ year flatbed experience", "Tarping experience", "Clean record"],
                "benefits": ["Weekly Home Time", "Medical/Dental/Vision", "Bonus Programs", "Modern Equipment"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Dedicated Lane - TX to CA",
                "location": "Texas to California",
                "pay": "$1,600 Guaranteed Weekly",
                "job_type": "Contract",
                "description": "Dedicated lane running from Texas to California. Consistent freight, predictable schedule.",
                "requirements": ["Valid CDL-A", "6+ months experience", "TWIC Card preferred", "Doubles endorsement a plus"],
                "benefits": ["Guaranteed Pay", "Fuel Cards", "Rider Program", "Pet Friendly"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Local P&D Driver",
                "location": "Major Metro Areas",
                "pay": "$22 - $28 / hour",
                "job_type": "Full Time",
                "description": "Local pickup and delivery positions in major metropolitan areas. Home daily.",
                "requirements": ["Valid CDL-A", "1+ year experience", "Touch freight capability", "Customer service skills"],
                "benefits": ["Home Daily", "Overtime Available", "Benefits Day 1", "Union Position"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Team Drivers - Coast to Coast",
                "location": "Nationwide",
                "pay": "$0.70 - $0.80 CPM Split",
                "job_type": "Full Time",
                "description": "Team driving positions for coast-to-coast expedited freight. High miles, high pay.",
                "requirements": ["Valid CDL-A", "Team experience preferred", "Hazmat endorsement", "Clean background"],
                "benefits": ["Top Miles", "Sign-on Bonus", "Referral Bonus", "Quarterly Safety Bonus"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Reefer Driver - Southeast Regional",
                "location": "Southeast Region",
                "pay": "$1,400 - $1,700 / week",
                "job_type": "Full Time",
                "description": "Temperature-controlled freight throughout the Southeast. Quality equipment and great lanes.",
                "requirements": ["Valid CDL-A", "Reefer experience", "Food-grade hauling knowledge", "Temp management skills"],
                "benefits": ["New Equipment", "Weekly Home Time", "Direct Deposit", "Rider Policy"],
                "is_active": True,
                "views": 0,
                "applications": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.job_listings.insert_many(jobs)
        return {"message": f"Seeded {len(jobs)} job listings"}
    return {"message": "Jobs already exist"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
