from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from enum import Enum
from email_service import EmailService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'buildconnect-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Enums
class UserType(str, Enum):
    builder = "builder"
    contractor = "contractor"

class ProjectStatus(str, Enum):
    open = "open"
    bidding_closed = "bidding_closed"
    awarded = "awarded"
    completed = "completed"
    cancelled = "cancelled"

class BidStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"

class ProjectType(str, Enum):
    residential = "residential"
    commercial = "commercial"
    infrastructure = "infrastructure"
    renovation = "renovation"

# Models
class SignupRequest(BaseModel):
    user_type: UserType
    full_name: str
    email: EmailStr
    phone: str
    company_name: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    full_name: str
    email: str
    phone: str
    user_type: UserType
    company_name: str
    created_at: str

class ContractorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    specializations: List[str]
    experience_years: Optional[int] = 0
    team_size: Optional[int] = 0
    service_locations: List[str]
    bio: Optional[str] = ""
    portfolio_images: List[str] = []
    rating: float = 0.0
    total_projects: int = 0
    verification_status: str = "pending"
    created_at: str

class ContractorUpdate(BaseModel):
    specializations: Optional[List[str]] = None
    experience_years: Optional[int] = None
    team_size: Optional[int] = None
    service_locations: Optional[List[str]] = None
    bio: Optional[str] = None
    portfolio_images: Optional[List[str]] = None

class ProjectCreate(BaseModel):
    title: str
    description: str
    project_type: ProjectType
    location: str
    city: str
    required_specializations: List[str]
    budget_min: int
    budget_max: int
    start_date: str
    duration_days: int
    bidding_deadline: str
    document_url: Optional[str] = None

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    builder_id: str
    builder_name: str
    builder_company: str
    title: str
    description: str
    project_type: ProjectType
    location: str
    city: str
    required_specializations: List[str]
    budget_min: int
    budget_max: int
    start_date: str
    duration_days: int
    status: ProjectStatus
    document_url: Optional[str] = None
    created_at: str
    bidding_deadline: str
    bid_count: int = 0

class BidCreate(BaseModel):
    project_id: str
    quoted_price: int
    estimated_duration: int
    proposal: str
    attachments: List[str] = []

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_id: str
    sender_id: str
    sender_name: str
    sender_type: str
    message: str
    created_at: str

class ChatMessageCreate(BaseModel):
    project_id: str
    message: str

class Milestone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_id: str
    title: str
    description: str
    amount: int
    due_date: str
    status: str  # pending, in_progress, completed, paid
    created_at: str

class MilestoneCreate(BaseModel):
    title: str
    description: str
    amount: int
    due_date: str

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_id: str
    milestone_id: str
    amount: int
    payment_method: str
    upi_id: Optional[str] = None
    transaction_id: Optional[str] = None
    status: str  # pending, completed, failed
    created_at: str

class PaymentCreate(BaseModel):
    milestone_id: str
    upi_id: str

class Bid(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_id: str
    project_title: str
    contractor_id: str
    contractor_name: str
    contractor_company: str
    contractor_rating: float
    contractor_experience: int
    contractor_total_projects: int
    quoted_price: int
    estimated_duration: int
    proposal: str
    attachments: List[str]
    status: BidStatus
    created_at: str

# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.profiles.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# Routes
@api_router.get("/")
async def root():
    return {"message": "BuildConnect API"}

@api_router.post("/auth/signup")
async def signup(request: SignupRequest):
    # Check if email exists
    existing_user = await db.profiles.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user profile
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(request.password)
    
    profile_doc = {
        "id": user_id,
        "full_name": request.full_name,
        "email": request.email,
        "phone": request.phone,
        "user_type": request.user_type.value,
        "company_name": request.company_name,
        "password_hash": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.profiles.insert_one(profile_doc)
    
    # If contractor, create contractor profile
    if request.user_type == UserType.contractor:
        contractor_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "specializations": [],
            "experience_years": 0,
            "team_size": 0,
            "service_locations": [],
            "bio": "",
            "portfolio_images": [],
            "rating": 0.0,
            "total_projects": 0,
            "verification_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.contractors.insert_one(contractor_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id, "user_type": request.user_type.value})
    
    return {
        "success": True,
        "access_token": access_token,
        "user": {
            "id": user_id,
            "full_name": request.full_name,
            "email": request.email,
            "user_type": request.user_type.value
        },
        "redirect_to": f"/{request.user_type.value}/dashboard"
    }

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    user = await db.profiles.find_one({"email": request.email}, {"_id": 0})
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["id"], "user_type": user["user_type"]})
    
    return {
        "success": True,
        "access_token": access_token,
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "user_type": user["user_type"]
        },
        "redirect_to": f"/{user['user_type']}/dashboard"
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"success": True, "user": current_user}

# Builder routes
@api_router.post("/builder/projects")
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "builder":
        raise HTTPException(status_code=403, detail="Only builders can create projects")
    
    project_id = str(uuid.uuid4())
    project_doc = {
        "id": project_id,
        "builder_id": current_user["id"],
        "builder_name": current_user["full_name"],
        "builder_company": current_user["company_name"],
        "title": project.title,
        "description": project.description,
        "project_type": project.project_type.value,
        "location": project.location,
        "city": project.city,
        "required_specializations": project.required_specializations,
        "budget_min": project.budget_min,
        "budget_max": project.budget_max,
        "start_date": project.start_date,
        "duration_days": project.duration_days,
        "status": ProjectStatus.open.value,
        "document_url": project.document_url,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "bidding_deadline": project.bidding_deadline,
        "bid_count": 0
    }
    
    await db.projects.insert_one(project_doc)
    return {"success": True, "project_id": project_id}

@api_router.get("/builder/projects", response_model=List[Project])
async def get_builder_projects(status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "builder":
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = {"builder_id": current_user["id"]}
    if status:
        query["status"] = status
    
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return projects

@api_router.get("/builder/projects/{project_id}")
async def get_project_detail(project_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "builder":
        raise HTTPException(status_code=403, detail="Access denied")
    
    project = await db.projects.find_one({"id": project_id, "builder_id": current_user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get bids for this project
    bids = await db.bids.find({"project_id": project_id}, {"_id": 0}).sort("quoted_price", 1).to_list(1000)
    
    return {"success": True, "project": project, "bids": bids}

@api_router.post("/builder/projects/{project_id}/award/{bid_id}")
async def award_bid(project_id: str, bid_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "builder":
        raise HTTPException(status_code=403, detail="Access denied")
    
    project = await db.projects.find_one({"id": project_id, "builder_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get accepted bid
    accepted_bid = await db.bids.find_one({"id": bid_id}, {"_id": 0})
    if not accepted_bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    # Get contractor info for email
    contractor = await db.contractors.find_one({"id": accepted_bid["contractor_id"]}, {"_id": 0})
    contractor_user = await db.profiles.find_one({"id": contractor["user_id"]}, {"_id": 0})
    
    # Update bid status
    await db.bids.update_one({"id": bid_id}, {"$set": {"status": BidStatus.accepted.value}})
    
    # Get all rejected bids for email
    rejected_bids = await db.bids.find(
        {"project_id": project_id, "id": {"$ne": bid_id}, "status": "pending"}, 
        {"_id": 0}
    ).to_list(1000)
    
    # Reject all other bids
    await db.bids.update_many(
        {"project_id": project_id, "id": {"$ne": bid_id}},
        {"$set": {"status": BidStatus.rejected.value}}
    )
    
    # Update project status
    await db.projects.update_one({"id": project_id}, {"$set": {"status": ProjectStatus.awarded.value, "awarded_contractor_id": contractor["id"]}})
    
    # Send acceptance email to winner
    await EmailService.send_bid_accepted_email(
        contractor_user["email"],
        contractor_user["full_name"],
        project["title"],
        current_user["full_name"],
        current_user["company_name"]
    )
    
    # Send rejection emails to others
    for rejected_bid in rejected_bids:
        rejected_contractor = await db.contractors.find_one({"id": rejected_bid["contractor_id"]}, {"_id": 0})
        if rejected_contractor:
            rejected_user = await db.profiles.find_one({"id": rejected_contractor["user_id"]}, {"_id": 0})
            if rejected_user:
                await EmailService.send_bid_rejected_email(
                    rejected_user["email"],
                    rejected_user["full_name"],
                    project["title"]
                )
    
    return {"success": True, "message": "Bid awarded successfully"}

@api_router.get("/builder/dashboard/stats")
async def get_builder_stats(current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "builder":
        raise HTTPException(status_code=403, detail="Access denied")
    
    active_projects = await db.projects.count_documents({"builder_id": current_user["id"], "status": "open"})
    total_bids = await db.bids.count_documents({"project_id": {"$in": [p["id"] async for p in db.projects.find({"builder_id": current_user["id"]}, {"id": 1})]}})
    completed_projects = await db.projects.count_documents({"builder_id": current_user["id"], "status": "completed"})
    
    return {
        "active_projects": active_projects,
        "total_bids": total_bids,
        "completed_projects": completed_projects
    }

# Contractor routes
@api_router.get("/contractor/projects", response_model=List[Project])
async def browse_projects(city: Optional[str] = None, project_type: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "contractor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = {"status": ProjectStatus.open.value}
    if city:
        query["city"] = city
    if project_type:
        query["project_type"] = project_type
    
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return projects

@api_router.get("/contractor/projects/{project_id}")
async def get_project_for_contractor(project_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "contractor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if contractor already bid
    contractor_profile = await db.contractors.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if contractor_profile:
        existing_bid = await db.bids.find_one({"project_id": project_id, "contractor_id": contractor_profile["id"]}, {"_id": 0})
        return {"success": True, "project": project, "existing_bid": existing_bid}
    
    return {"success": True, "project": project, "existing_bid": None}

@api_router.post("/contractor/bids")
async def submit_bid(bid: BidCreate, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "contractor":
        raise HTTPException(status_code=403, detail="Only contractors can submit bids")
    
    # Get contractor profile
    contractor = await db.contractors.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor profile not found")
    
    # Check if already bid
    existing_bid = await db.bids.find_one({"project_id": bid.project_id, "contractor_id": contractor["id"]})
    if existing_bid:
        raise HTTPException(status_code=400, detail="You have already submitted a bid for this project")
    
    # Get project details
    project = await db.projects.find_one({"id": bid.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    bid_id = str(uuid.uuid4())
    bid_doc = {
        "id": bid_id,
        "project_id": bid.project_id,
        "project_title": project["title"],
        "contractor_id": contractor["id"],
        "contractor_name": current_user["full_name"],
        "contractor_company": current_user["company_name"],
        "contractor_rating": contractor["rating"],
        "contractor_experience": contractor["experience_years"],
        "contractor_total_projects": contractor["total_projects"],
        "quoted_price": bid.quoted_price,
        "estimated_duration": bid.estimated_duration,
        "proposal": bid.proposal,
        "attachments": bid.attachments,
        "status": BidStatus.pending.value,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bids.insert_one(bid_doc)
    
    # Update project bid count
    await db.projects.update_one({"id": bid.project_id}, {"$inc": {"bid_count": 1}})
    
    return {"success": True, "bid_id": bid_id}

@api_router.get("/contractor/bids", response_model=List[Bid])
async def get_contractor_bids(status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "contractor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    contractor = await db.contractors.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not contractor:
        return []
    
    query = {"contractor_id": contractor["id"]}
    if status:
        query["status"] = status
    
    bids = await db.bids.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bids

@api_router.get("/contractor/profile")
async def get_contractor_profile(current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "contractor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    contractor = await db.contractors.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor profile not found")
    
    return {"success": True, "profile": contractor}

@api_router.put("/contractor/profile")
async def update_contractor_profile(update: ContractorUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "contractor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    await db.contractors.update_one({"user_id": current_user["id"]}, {"$set": update_data})
    return {"success": True, "message": "Profile updated successfully"}

@api_router.get("/contractor/dashboard/stats")
async def get_contractor_stats(current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "contractor":
        raise HTTPException(status_code=403, detail="Access denied")
    
    contractor = await db.contractors.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not contractor:
        return {"total_bids": 0, "won_projects": 0, "rating": 0.0}
    
    total_bids = await db.bids.count_documents({"contractor_id": contractor["id"]})
    won_projects = await db.bids.count_documents({"contractor_id": contractor["id"], "status": "accepted"})
    
    return {
        "total_bids": total_bids,
        "won_projects": won_projects,
        "rating": contractor["rating"]
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()