# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
import os
import base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from app.core.config import settings
from app.models import User
from sqlalchemy.orm import Session
from app.db.session import SessionLocal

router = APIRouter(prefix="/auth", tags=["auth"])


# Funkcja do hash'owania hasła przy użyciu PBKDF2HMAC
def hash_password(password: str) -> str:
    salt = os.urandom(16)  # 16 bajtów salt
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())
    #convert salt and hash to string base64, next concatenate these separator
    salt_b64 = base64.urlsafe_b64encode(salt).decode('utf-8')
    key_b64 = base64.urlsafe_b64encode(key).decode('utf-8')
    return f"{salt_b64}${key_b64}"


# Funkcja do weryfikacji hasła
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_b64, key_b64 = hashed_password.split('$')
        salt = base64.urlsafe_b64decode(salt_b64.encode('utf-8'))
        stored_key = base64.urlsafe_b64decode(key_b64.encode('utf-8'))
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        kdf.verify(plain_password.encode(), stored_key)
        return True
    except Exception:
        return False


# Dependency – zwraca instancję sesji bazy danych
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Modele danych dla logowania i rejestracji
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegistration(BaseModel):
    username: str
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    user_id : int
    token_type: str


def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


# Funkcja symulująca wysyłkę maila aktywacyjnego – w produkcji należy wdrożyć prawdziwy mechanizm
def send_activation_email(email: str, token: str):
    print(f"Aktywacyjny email wysłany do {email} z tokenem: {token}")


@router.post("/register")
async def register(registration: UserRegistration, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Sprawdzenie czy użytkownik o podanym emailu już istnieje
    existing_user = db.query(User).filter(User.email == registration.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Użytkownik o podanym emailu już istnieje")

    # hash password in used lib cryoptography
    hashed_pwd = hash_password(registration.password)
    new_user = User(username=registration.username, email=registration.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generacja tokena aktywacyjnego ważnego przez 24 godziny
    activation_token = create_access_token(data={"sub": new_user.email}, expires_delta=timedelta(hours=24))
    background_tasks.add_task(send_activation_email, new_user.email, activation_token)

    return {"status": "Rejestracja udana, sprawdź email aby aktywować konto"}



@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Nieprawidłowy email lub hasło")
    access_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(hours=1))
    return {"access_token": access_token, "user_id": user.id, "token_type": "bearer"}

def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        return payload

    except jwt.ExpiredSignatureError:
        # Token jest przedawniony
        raise HTTPException(status_code=401, detail="Token wygasł")

    except jwt.InvalidTokenError:
        # Ogólna kategoria – nieważny token (zła sygnatura, zły format, itp.)
        raise HTTPException(status_code=403, detail="Nieprawidłowy token")


