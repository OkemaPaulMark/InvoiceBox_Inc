from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import enum
import uuid
from faker import Faker
import uvicorn
from contextlib import asynccontextmanager
from typing import Optional

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./invoicebox.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = "invoicebox-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Enums
class UserRole(str, enum.Enum):
    provider = "provider"
    purchaser = "purchaser"

class Currency(str, enum.Enum):
    UGX = "UGX"
    USD = "USD"
    LYD = "LYD"

class InvoiceStatus(str, enum.Enum):
    pending = "Pending"
    payment_submitted = "Payment Submitted"
    paid = "Paid"
    defaulted = "Defaulted"

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(UserRole))
    
    provided_invoices = relationship("Invoice", foreign_keys="Invoice.provider_id", back_populates="provider")
    purchased_invoices = relationship("Invoice", foreign_keys="Invoice.purchaser_id", back_populates="purchaser")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(String)
    amount = Column(Float)
    currency = Column(Enum(Currency))
    provider_id = Column(Integer, ForeignKey("users.id"))
    purchaser_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.pending)
    payment_reference = Column(String, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    date_created = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    provider = relationship("User", foreign_keys=[provider_id], back_populates="provided_invoices")
    purchaser = relationship("User", foreign_keys=[purchaser_id], back_populates="purchased_invoices")

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole

class UserLogin(BaseModel):
    username: str
    password: str

class InvoiceCreate(BaseModel):
    title: str
    description: str
    amount: float
    currency: Currency
    purchaser_id: int

class InvoiceUpdate(BaseModel):
    status: InvoiceStatus
    payment_reference: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password[:72])

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def create_dummy_data(db: Session):
    fake = Faker()
    
    # Create users
    provider = User(username="provider1", email="provider@test.com", password_hash=get_password_hash("password"), role=UserRole.provider)
    purchaser = User(username="purchaser1", email="purchaser@test.com", password_hash=get_password_hash("password"), role=UserRole.purchaser)
    
    db.add_all([provider, purchaser])
    db.commit()
    
    # Create invoices
    for i in range(5):
        invoice = Invoice(
            invoice_number=f"INV-{str(uuid.uuid4())[:8].upper()}",
            title=f"Invoice {i+1}",
            description=fake.text(max_nb_chars=100),
            amount=fake.random_int(min=100, max=5000),
            currency=fake.random_element(elements=("UGX", "USD", "LYD")),
            provider_id=provider.id,
            purchaser_id=purchaser.id,
            status=fake.random_element(elements=("Pending", "Payment Submitted", "Paid", "Defaulted"))
        )
        db.add(invoice)
    db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if not db.query(User).first():
        create_dummy_data(db)
    db.close()
    yield

# FastAPI app
app = FastAPI(title="InvoiceBox Inc API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Routes
@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_id": db_user.id, "role": db_user.role}

@app.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_id": db_user.id, "role": db_user.role}

@app.get("/invoices")
def get_invoices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.provider:
        invoices = db.query(Invoice).filter(Invoice.provider_id == current_user.id).all()
    else:
        invoices = db.query(Invoice).filter(Invoice.purchaser_id == current_user.id).all()
    
    # Add purchaser/provider info to response
    result = []
    for invoice in invoices:
        invoice_dict = {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "title": invoice.title,
            "description": invoice.description,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "status": invoice.status,
            "payment_reference": invoice.payment_reference,
            "payment_date": invoice.payment_date.isoformat() if invoice.payment_date else None,
            "date_created": invoice.date_created.isoformat() if invoice.date_created else None,
            "purchaser_name": invoice.purchaser.username if invoice.purchaser else None,
            "provider_name": invoice.provider.username if invoice.provider else None
        }
        result.append(invoice_dict)
    return result

@app.post("/invoices")
def create_invoice(invoice: InvoiceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.provider:
        raise HTTPException(status_code=403, detail="Only providers can create invoices")
    
    db_invoice = Invoice(
        invoice_number=f"INV-{str(uuid.uuid4())[:8].upper()}",
        title=invoice.title,
        description=invoice.description,
        amount=invoice.amount,
        currency=invoice.currency,
        provider_id=current_user.id,
        purchaser_id=invoice.purchaser_id
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.put("/invoices/{invoice_id}")
def update_invoice(invoice_id: int, invoice_update: InvoiceUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Purchaser can submit payment or mark as defaulted
    if current_user.role == UserRole.purchaser:
        if invoice.purchaser_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if invoice_update.status == InvoiceStatus.payment_submitted:
            if not invoice_update.payment_reference:
                raise HTTPException(status_code=400, detail="Payment reference required")
            invoice.payment_reference = invoice_update.payment_reference
            invoice.payment_date = datetime.now(timezone.utc)
        
        invoice.status = invoice_update.status
    
    # Provider can confirm payment or mark as defaulted
    elif current_user.role == UserRole.provider:
        if invoice.provider_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Provider can only confirm payment if payment was submitted
        if invoice_update.status == InvoiceStatus.paid and invoice.status != InvoiceStatus.payment_submitted:
            raise HTTPException(status_code=400, detail="Payment must be submitted first")
        
        invoice.status = invoice_update.status
    
    db.commit()
    db.refresh(invoice)
    
    # Return updated invoice with all fields
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "title": invoice.title,
        "description": invoice.description,
        "amount": invoice.amount,
        "currency": invoice.currency,
        "status": invoice.status,
        "payment_reference": invoice.payment_reference,
        "payment_date": invoice.payment_date.isoformat() if invoice.payment_date else None,
        "date_created": invoice.date_created.isoformat() if invoice.date_created else None,
        "purchaser_name": invoice.purchaser.username if invoice.purchaser else None,
        "provider_name": invoice.provider.username if invoice.provider else None
    }

@app.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.provider:
        invoices = db.query(Invoice).filter(Invoice.provider_id == current_user.id).all()
    else:
        invoices = db.query(Invoice).filter(Invoice.purchaser_id == current_user.id).all()
    
    total_amount = sum(inv.amount for inv in invoices)
    paid_amount = sum(inv.amount for inv in invoices if inv.status == InvoiceStatus.paid)
    pending_count = len([inv for inv in invoices if inv.status == InvoiceStatus.pending])
    payment_submitted_count = len([inv for inv in invoices if inv.status == InvoiceStatus.payment_submitted])
    
    return {
        "total_invoices": len(invoices),
        "total_amount": total_amount,
        "paid_amount": paid_amount,
        "pending_count": pending_count,
        "payment_submitted_count": payment_submitted_count
    }

@app.get("/analytics")
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.provider:
        invoices = db.query(Invoice).filter(Invoice.provider_id == current_user.id).all()
    else:
        invoices = db.query(Invoice).filter(Invoice.purchaser_id == current_user.id).all()
    
    # Status breakdown
    status_counts = {"Pending": 0, "Payment Submitted": 0, "Paid": 0, "Defaulted": 0}
    currency_totals = {"USD": 0, "UGX": 0, "LYD": 0}
    
    for inv in invoices:
        status_counts[inv.status] += 1
        currency_totals[inv.currency] += inv.amount
    
    # Monthly data (last 6 months)
    monthly_data = []
    for i in range(6):
        month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
        month_invoices = [inv for inv in invoices if inv.date_created and inv.date_created.month == month_start.month]
        monthly_data.append({
            "month": month_start.strftime("%b %Y"),
            "count": len(month_invoices),
            "amount": sum(inv.amount for inv in month_invoices)
        })
    
    return {
        "status_breakdown": status_counts,
        "currency_breakdown": currency_totals,
        "monthly_trends": list(reversed(monthly_data))
    }

@app.get("/users")
def get_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.provider:
        return db.query(User).filter(User.role == UserRole.purchaser).all()
    return []

# Serve React app
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if os.path.exists("static"):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        file_path = f"static/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        else:
            return FileResponse("static/index.html")
    else:
        raise HTTPException(status_code=404, detail="Static files not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)