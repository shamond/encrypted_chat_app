from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.models import User
from app.routers.auth import get_db

router = APIRouter(prefix="/users", tags=["users"])

# Schemat użytkownika do wyszukiwania – możesz rozszerzyć pola według potrzeb
class UserSchema(BaseModel):
    id: int
    username: str
    avatar: str | None = None

    class Config:
        orm_mode = True

@router.get("/", response_model=List[UserSchema])
def get_users(search: str = Query("", description="Fraza do wyszukiwania w nazwach użytkowników"), db: Session = Depends(get_db)):
    # Używamy ilike aby wyszukać nie uwzględniając wielkości liter
    users = db.query(User).filter(User.username.ilike(f"%{search}%")).all()
    return users