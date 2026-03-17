from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)
JWT_SECRET = os.environ.get('JWT_SECRET', 'hammr-secret-key-2025')
JWT_ALGORITHM = "HS256"

# LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="HAMMR API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class UserRole:
    CUSTOMER = "customer"
    CONTRACTOR = "contractor"
    ADMIN = "admin"

class JobStatus:
    PENDING = "pending"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus:
    PENDING = "pending"
    IN_ESCROW = "in_escrow"
    RELEASED = "released"
    REFUNDED = "refunded"

# User Models
class UserBase(BaseModel):
    email: str
    full_name: str
    phone: str
    role: str = UserRole.CUSTOMER

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    avatar_url: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    is_verified: bool = False
    is_blocked: bool = False
    subscription_tier: Optional[str] = None
    skills: List[str] = []
    about_me: Optional[str] = None
    location: str = "San Salvador"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str
    role: str
    avatar_url: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    is_verified: bool = False
    subscription_tier: Optional[str] = None
    skills: List[str] = []
    about_me: Optional[str] = None
    location: str = "San Salvador"

# Service Models
class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    icon: str
    base_price: float
    is_featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceCreate(BaseModel):
    name: str
    description: str
    category: str
    icon: str
    base_price: float

# Job Models
class JobCreate(BaseModel):
    service_id: str
    description: str
    location: str
    scheduled_date: Optional[str] = None
    budget: Optional[float] = None

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    contractor_id: Optional[str] = None
    service_id: str
    service_name: str
    description: str
    location: str
    status: str = JobStatus.PENDING
    scheduled_date: Optional[str] = None
    budget: float
    final_price: Optional[float] = None
    commission_rate: float = 0.10  # 10% commission
    commission_amount: float = 0.0
    payment_status: str = PaymentStatus.PENDING
    customer_rating: Optional[float] = None
    contractor_rating: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class JobUpdate(BaseModel):
    status: Optional[str] = None
    contractor_id: Optional[str] = None
    final_price: Optional[float] = None

# Bid Models
class BidCreate(BaseModel):
    amount: float
    message: Optional[str] = ""
    estimated_hours: Optional[float] = None

class Bid(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    contractor_id: str
    contractor_name: str = ""
    contractor_rating: float = 0.0
    contractor_avatar: Optional[str] = None
    amount: float
    message: str = ""
    estimated_hours: Optional[float] = None
    status: str = "pending"  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Finance Models
class FinanceSummary(BaseModel):
    total_jobs: int
    completed_jobs: int
    total_revenue: float
    total_commissions: float
    pending_payouts: float

# AI Models
class PricingRequest(BaseModel):
    job_type: str
    complexity: str
    location: str
    demand: str

class PricingResponse(BaseModel):
    base_price: float
    adjustments: dict
    final_price: float
    explanation: str

class MarketingRequest(BaseModel):
    segment: str
    category: str
    platform: str

class MarketingResponse(BaseModel):
    ad_copy: str
    suggestions: List[dict]

# ============== AUTH HELPERS ==============

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            return await db.users.find_one({"id": user_id})
    except:
        pass
    return None

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "HAMMR API v1.0", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        avatar_url=f"https://ui-avatars.com/api/?name={user_data.full_name.replace(' ', '+')}&background=2563eb&color=fff"
    )
    user_dict = user.dict()
    user_dict["password_hash"] = get_password_hash(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token({"sub": user.id})
    return {"token": token, "user": UserResponse(**user_dict)}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="Account is blocked")
    
    token = create_access_token({"sub": user["id"]})
    return {"token": token, "user": UserResponse(**user)}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ============== USER ROUTES ==============

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(
    role: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(query).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@api_router.put("/users/{user_id}/block")
async def block_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.users.update_one({"id": user_id}, {"$set": {"is_blocked": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User blocked"}

@api_router.put("/users/{user_id}/verify")
async def verify_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.users.update_one({"id": user_id}, {"$set": {"is_verified": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User verified"}

@api_router.get("/contractors", response_model=List[UserResponse])
async def get_contractors(
    service: Optional[str] = None,
    verified_only: bool = False
):
    query = {"role": UserRole.CONTRACTOR}
    if verified_only:
        query["is_verified"] = True
    if service:
        query["skills"] = {"$in": [service]}
    
    contractors = await db.users.find(query).sort("rating", -1).to_list(100)
    return [UserResponse(**c) for c in contractors]

# ============== SERVICE ROUTES ==============

@api_router.get("/services", response_model=List[Service])
async def get_services(category: Optional[str] = None, featured: bool = False):
    query = {}
    if category:
        query["category"] = category
    if featured:
        query["is_featured"] = True
    
    services = await db.services.find(query).to_list(100)
    return [Service(**s) for s in services]

@api_router.post("/services", response_model=Service)
async def create_service(service: ServiceCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service_obj = Service(**service.dict())
    await db.services.insert_one(service_obj.dict())
    return service_obj

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return Service(**service)

# ============== JOB ROUTES ==============

@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate, current_user: dict = Depends(get_current_user)):
    # Get service info
    service = await db.services.find_one({"id": job_data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    budget = job_data.budget or service["base_price"]
    
    job = Job(
        customer_id=current_user["id"],
        service_id=job_data.service_id,
        service_name=service["name"],
        description=job_data.description,
        location=job_data.location,
        scheduled_date=job_data.scheduled_date,
        budget=budget
    )
    
    await db.jobs.insert_one(job.dict())
    return job

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    contractor_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    # Filter based on user role
    if current_user["role"] == UserRole.CUSTOMER:
        query["customer_id"] = current_user["id"]
    elif current_user["role"] == UserRole.CONTRACTOR:
        # Contractors see available jobs or their assigned jobs
        if contractor_id:
            query["contractor_id"] = contractor_id
        else:
            query["$or"] = [
                {"contractor_id": current_user["id"]},
                {"status": JobStatus.PENDING, "contractor_id": None}
            ]
    
    if status:
        query["status"] = status
    if customer_id and current_user["role"] == UserRole.ADMIN:
        query["customer_id"] = customer_id
    
    jobs = await db.jobs.find(query).sort("created_at", -1).to_list(100)
    return [Job(**j) for j in jobs]

@api_router.get("/jobs/available", response_model=List[Job])
async def get_available_jobs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.CONTRACTOR:
        raise HTTPException(status_code=403, detail="Contractor access required")
    
    jobs = await db.jobs.find({
        "status": JobStatus.PENDING,
        "contractor_id": None
    }).sort("created_at", -1).to_list(50)
    return [Job(**j) for j in jobs]

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return Job(**job)

@api_router.put("/jobs/{job_id}/accept")
async def accept_job(job_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.CONTRACTOR:
        raise HTTPException(status_code=403, detail="Contractor access required")
    
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != JobStatus.PENDING:
        raise HTTPException(status_code=400, detail="Job is not available")
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": {
            "contractor_id": current_user["id"],
            "status": JobStatus.ACCEPTED,
            "payment_status": PaymentStatus.IN_ESCROW
        }}
    )
    return {"message": "Job accepted"}

@api_router.put("/jobs/{job_id}/start")
async def start_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["contractor_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not your job")
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": {"status": JobStatus.IN_PROGRESS}}
    )
    return {"message": "Job started"}

@api_router.put("/jobs/{job_id}/complete")
async def complete_job(job_id: str, final_price: Optional[float] = None, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["contractor_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not your job")
    
    price = final_price or job["budget"]
    commission = price * job["commission_rate"]
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": {
            "status": JobStatus.COMPLETED,
            "final_price": price,
            "commission_amount": commission,
            "payment_status": PaymentStatus.RELEASED,
            "completed_at": datetime.utcnow()
        }}
    )
    
    # Update contractor stats
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"review_count": 1}}
    )
    
    return {"message": "Job completed", "commission": commission}

@api_router.put("/jobs/{job_id}/cancel")
async def cancel_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Only customer, assigned contractor, or admin can cancel
    if current_user["role"] not in [UserRole.ADMIN] and \
       current_user["id"] not in [job["customer_id"], job.get("contractor_id")]:
        raise HTTPException(status_code=403, detail="Cannot cancel this job")
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": {
            "status": JobStatus.CANCELLED,
            "payment_status": PaymentStatus.REFUNDED
        }}
    )
    return {"message": "Job cancelled"}

@api_router.put("/jobs/{job_id}/rate")
async def rate_job(job_id: str, rating: float, current_user: dict = Depends(get_current_user)):
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only rate completed jobs")
    
    if current_user["id"] == job["customer_id"]:
        # Customer rating the contractor
        await db.jobs.update_one({"id": job_id}, {"$set": {"contractor_rating": rating}})
        if job.get("contractor_id"):
            # Update contractor's average rating
            contractor_jobs = await db.jobs.find({
                "contractor_id": job["contractor_id"],
                "contractor_rating": {"$exists": True}
            }).to_list(1000)
            if contractor_jobs:
                avg_rating = sum(j.get("contractor_rating", 0) for j in contractor_jobs) / len(contractor_jobs)
                await db.users.update_one(
                    {"id": job["contractor_id"]},
                    {"$set": {"rating": round(avg_rating, 1)}}
                )
    elif current_user["id"] == job.get("contractor_id"):
        # Contractor rating the customer
        await db.jobs.update_one({"id": job_id}, {"$set": {"customer_rating": rating}})
    else:
        raise HTTPException(status_code=403, detail="Cannot rate this job")
    
    return {"message": "Rating submitted"}

# ============== BID ROUTES ==============

@api_router.post("/jobs/{job_id}/bid")
async def place_bid(job_id: str, bid_data: BidCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.CONTRACTOR:
        raise HTTPException(status_code=403, detail="Contractor access required")
    
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != JobStatus.PENDING:
        raise HTTPException(status_code=400, detail="Job is no longer accepting bids")
    
    # Check if contractor already bid on this job
    existing_bid = await db.bids.find_one({"job_id": job_id, "contractor_id": current_user["id"]})
    if existing_bid:
        raise HTTPException(status_code=400, detail="You already bid on this job")
    
    bid = Bid(
        job_id=job_id,
        contractor_id=current_user["id"],
        contractor_name=current_user.get("full_name", ""),
        contractor_rating=current_user.get("rating", 0.0),
        contractor_avatar=current_user.get("avatar_url"),
        amount=bid_data.amount,
        message=bid_data.message or "",
        estimated_hours=bid_data.estimated_hours,
    )
    
    await db.bids.insert_one(bid.dict())
    
    # Update bid count on job
    bid_count = await db.bids.count_documents({"job_id": job_id})
    await db.jobs.update_one({"id": job_id}, {"$set": {"bid_count": bid_count}})
    
    return {"message": "Bid placed successfully", "bid_id": bid.id}

@api_router.get("/jobs/{job_id}/bids")
async def get_job_bids(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Only the job owner, admin, or the bidding contractor can see bids
    if current_user["role"] == UserRole.CUSTOMER and current_user["id"] != job["customer_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    bids = await db.bids.find({"job_id": job_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return bids

@api_router.put("/bids/{bid_id}/accept")
async def accept_bid(bid_id: str, current_user: dict = Depends(get_current_user)):
    bid = await db.bids.find_one({"id": bid_id})
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    job = await db.jobs.find_one({"id": bid["job_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if current_user["id"] != job["customer_id"]:
        raise HTTPException(status_code=403, detail="Only the job owner can accept bids")
    if job["status"] != JobStatus.PENDING:
        raise HTTPException(status_code=400, detail="Job is no longer accepting bids")
    
    # Accept this bid
    await db.bids.update_one({"id": bid_id}, {"$set": {"status": "accepted"}})
    
    # Reject all other bids for this job
    await db.bids.update_many(
        {"job_id": bid["job_id"], "id": {"$ne": bid_id}},
        {"$set": {"status": "rejected"}}
    )
    
    # Update the job with contractor and accepted price
    await db.jobs.update_one(
        {"id": bid["job_id"]},
        {"$set": {
            "contractor_id": bid["contractor_id"],
            "status": JobStatus.ACCEPTED,
            "budget": bid["amount"],
            "payment_status": PaymentStatus.IN_ESCROW,
        }}
    )
    
    return {"message": "Bid accepted", "contractor_id": bid["contractor_id"]}

@api_router.get("/bids/my")
async def get_my_bids(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.CONTRACTOR:
        raise HTTPException(status_code=403, detail="Contractor access required")
    
    bids = await db.bids.find({"contractor_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bids

# ============== FINANCE ROUTES ==============

@api_router.get("/finance/summary", response_model=FinanceSummary)
async def get_finance_summary(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_jobs = await db.jobs.count_documents({})
    completed_jobs = await db.jobs.count_documents({"status": JobStatus.COMPLETED})
    
    # Calculate totals
    pipeline = [
        {"$match": {"status": JobStatus.COMPLETED}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": "$final_price"},
            "total_commissions": {"$sum": "$commission_amount"}
        }}
    ]
    result = await db.jobs.aggregate(pipeline).to_list(1)
    
    totals = result[0] if result else {"total_revenue": 0, "total_commissions": 0}
    
    # Pending payouts (in escrow jobs)
    pending_pipeline = [
        {"$match": {"payment_status": PaymentStatus.IN_ESCROW}},
        {"$group": {"_id": None, "pending": {"$sum": "$budget"}}}
    ]
    pending_result = await db.jobs.aggregate(pending_pipeline).to_list(1)
    pending = pending_result[0]["pending"] if pending_result else 0
    
    return FinanceSummary(
        total_jobs=total_jobs,
        completed_jobs=completed_jobs,
        total_revenue=totals.get("total_revenue", 0),
        total_commissions=totals.get("total_commissions", 0),
        pending_payouts=pending
    )

@api_router.get("/finance/contractor/{contractor_id}")
async def get_contractor_earnings(contractor_id: str, current_user: dict = Depends(get_current_user)):
    # Contractor can see their own, admin can see all
    if current_user["role"] != UserRole.ADMIN and current_user["id"] != contractor_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    completed = await db.jobs.find({
        "contractor_id": contractor_id,
        "status": JobStatus.COMPLETED
    }).to_list(1000)
    
    total_earned = sum(j.get("final_price", 0) - j.get("commission_amount", 0) for j in completed)
    pending_jobs = await db.jobs.find({
        "contractor_id": contractor_id,
        "status": {"$in": [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS]}
    }).to_list(100)
    pending_amount = sum(j.get("budget", 0) for j in pending_jobs)
    
    return {
        "total_earned": total_earned,
        "completed_jobs": len(completed),
        "pending_amount": pending_amount,
        "pending_jobs": len(pending_jobs)
    }

# ============== AI ROUTES ==============

@api_router.post("/ai/pricing", response_model=PricingResponse)
async def get_ai_pricing(request: PricingRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"pricing-{uuid.uuid4()}",
            system_message="""You are a pricing expert for home services in El Salvador. 
            Analyze the job details and provide a fair market price suggestion.
            Respond in JSON format: {"base_price": number, "explanation": "brief explanation"}"""
        ).with_model("gemini", "gemini-2.0-flash")
        
        prompt = f"""
        Calculate a fair price for this job in El Salvador (USD):
        - Job Type: {request.job_type}
        - Complexity: {request.complexity}
        - Location: {request.location}
        - Market Demand: {request.demand}
        
        Consider local labor costs and market rates. Return only JSON.
        """
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse response
        import json
        try:
            # Try to extract JSON from response
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            
            data = json.loads(json_str.strip())
            base_price = float(data.get("base_price", 50))
            explanation = data.get("explanation", "AI-suggested price based on market analysis")
        except:
            base_price = 50.0
            explanation = response[:200] if response else "Price suggestion based on market analysis"
        
        # Apply adjustments
        adjustments = {}
        final_price = base_price
        
        if request.complexity == "High":
            adjustments["complexity"] = base_price * 0.3
            final_price += base_price * 0.3
        elif request.complexity == "Low":
            adjustments["complexity"] = -base_price * 0.15
            final_price -= base_price * 0.15
        
        if request.demand == "High":
            adjustments["demand"] = base_price * 0.2
            final_price += base_price * 0.2
        elif request.demand == "Low":
            adjustments["demand"] = -base_price * 0.1
            final_price -= base_price * 0.1
        
        return PricingResponse(
            base_price=base_price,
            adjustments=adjustments,
            final_price=round(final_price, 2),
            explanation=explanation
        )
    except Exception as e:
        logging.error(f"AI Pricing error: {e}")
        # Fallback pricing
        base_prices = {
            "Plumbing Repair": 60, "Electrical Wiring": 75, "House Painting": 100,
            "Garden Maintenance": 40, "Carpentry Work": 80, "AC Installation": 120,
            "Cleaning": 35, "Roof Repair": 150
        }
        base = base_prices.get(request.job_type, 50)
        return PricingResponse(
            base_price=base,
            adjustments={},
            final_price=base,
            explanation="Standard market rate"
        )

@api_router.post("/ai/marketing", response_model=MarketingResponse)
async def get_ai_marketing(request: MarketingRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"marketing-{uuid.uuid4()}",
            system_message="""You are a marketing expert for HAMMR, a home services app in El Salvador.
            Create compelling ad copy and campaign suggestions. Be concise and impactful.
            Write in Spanish for local audience appeal but include English translation."""
        ).with_model("gemini", "gemini-2.0-flash")
        
        prompt = f"""
        Create ad copy for HAMMR app:
        - Target Audience: {request.segment}
        - Service Category: {request.category}
        - Platform: {request.platform}
        
        Include:
        1. A catchy headline (Spanish + English)
        2. Body copy (2-3 sentences)
        3. Call to action
        """
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        return MarketingResponse(
            ad_copy=response,
            suggestions=[
                {"segment": request.segment, "category": request.category, "platform": request.platform, "rationale": "Based on your input"}
            ]
        )
    except Exception as e:
        logging.error(f"AI Marketing error: {e}")
        return MarketingResponse(
            ad_copy=f"HAMMR - Tu solución en {request.category}\n\nConecta con profesionales verificados en El Salvador. Servicios rápidos, precios justos.\n\n¡Descarga HAMMR hoy!",
            suggestions=[]
        )

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial data"""
    
    # Check if already seeded
    existing_services = await db.services.count_documents({})
    if existing_services > 0:
        return {"message": "Database already seeded"}
    
    # Create services
    services = [
        Service(name="Plumbing Repair", description="Fix leaks, pipes, and plumbing issues", category="Repair", icon="plumbing", base_price=50),
        Service(name="Electrical Wiring", description="Electrical installation and repairs", category="Repair", icon="electrical", base_price=65),
        Service(name="House Painting", description="Interior and exterior painting", category="Renovation", icon="paint", base_price=100),
        Service(name="Garden Maintenance", description="Lawn care and landscaping", category="Outdoor", icon="garden", base_price=35),
        Service(name="Carpentry Work", description="Furniture and woodwork", category="Renovation", icon="carpentry", base_price=75),
        Service(name="AC Installation", description="Air conditioning setup and maintenance", category="Installation", icon="ac", base_price=120),
        Service(name="House Cleaning", description="Deep cleaning services", category="Cleaning", icon="cleaning", base_price=40, is_featured=True),
        Service(name="Roof Repair", description="Roof fixes and waterproofing", category="Repair", icon="roof", base_price=150),
        Service(name="Appliance Repair", description="Fix household appliances", category="Repair", icon="appliance", base_price=45),
        Service(name="Moving Services", description="Help with relocation", category="Moving", icon="moving", base_price=80, is_featured=True),
    ]
    
    for service in services:
        await db.services.insert_one(service.dict())
    
    # Create admin user
    admin = User(
        email="admin@hammr.com",
        full_name="Admin User",
        phone="555-0001",
        role=UserRole.ADMIN,
        is_verified=True,
        avatar_url="https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff"
    )
    admin_dict = admin.dict()
    admin_dict["password_hash"] = get_password_hash("admin123")
    await db.users.insert_one(admin_dict)
    
    # Create sample contractors
    contractor_names = ["Carlos Ramirez", "Maria Lopez", "Juan Martinez", "Ana Garcia", "Pedro Hernandez"]
    skills_pool = ["Plumbing Repair", "Electrical Wiring", "House Painting", "Carpentry Work", "House Cleaning"]
    
    for i, name in enumerate(contractor_names):
        contractor = User(
            email=f"contractor{i+1}@hammr.com",
            full_name=name,
            phone=f"555-01{i+1:02d}",
            role=UserRole.CONTRACTOR,
            is_verified=i < 3,
            rating=round(4.0 + (i * 0.2), 1),
            review_count=10 + i * 5,
            skills=skills_pool[i:i+2] if i < len(skills_pool) - 1 else [skills_pool[i]],
            about_me="Profesional con años de experiencia en servicios del hogar.",
            avatar_url=f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=2563eb&color=fff"
        )
        contractor_dict = contractor.dict()
        contractor_dict["password_hash"] = get_password_hash("password123")
        await db.users.insert_one(contractor_dict)
    
    # Create sample customers
    customer_names = ["Sofia Mendez", "Roberto Silva", "Carmen Flores"]
    for i, name in enumerate(customer_names):
        customer = User(
            email=f"customer{i+1}@hammr.com",
            full_name=name,
            phone=f"555-02{i+1:02d}",
            role=UserRole.CUSTOMER,
            rating=round(4.5 + (i * 0.1), 1),
            avatar_url=f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=16a34a&color=fff"
        )
        customer_dict = customer.dict()
        customer_dict["password_hash"] = get_password_hash("password123")
        await db.users.insert_one(customer_dict)
    
    return {"message": "Database seeded successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
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
