from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
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


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Lead/Driver Application Model
class DriverLeadCreate(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    cdl_experience: int
    zip_code: str

class DriverLead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone: str
    email: str
    cdl_experience: int
    zip_code: str
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Job Listing Model
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

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Skillconnect LLC API - CDL Driver Recruiting"}

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

# Driver Lead Routes
@api_router.post("/leads", response_model=DriverLead)
async def submit_driver_lead(input: DriverLeadCreate):
    lead_obj = DriverLead(**input.model_dump())
    
    doc = lead_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.driver_leads.insert_one(doc)
    return lead_obj

@api_router.get("/leads", response_model=List[DriverLead])
async def get_driver_leads():
    leads = await db.driver_leads.find({}, {"_id": 0}).to_list(1000)
    
    for lead in leads:
        if isinstance(lead['created_at'], str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    
    return leads

# Job Listings Routes
@api_router.get("/jobs", response_model=List[JobListing])
async def get_job_listings():
    jobs = await db.job_listings.find({"is_active": True}, {"_id": 0}).to_list(100)
    return jobs

@api_router.get("/jobs/{job_id}", response_model=JobListing)
async def get_job_by_id(job_id: str):
    job = await db.job_listings.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# Seed initial job listings
@api_router.post("/jobs/seed")
async def seed_job_listings():
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
            "is_active": True
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
            "is_active": True
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
            "is_active": True
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
            "is_active": True
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
            "is_active": True
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
            "is_active": True
        }
    ]
    
    # Clear existing and insert new
    await db.job_listings.delete_many({})
    await db.job_listings.insert_many(jobs)
    
    return {"message": f"Seeded {len(jobs)} job listings"}

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
