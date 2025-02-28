from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import User
from app.routers.auth import get_db  # Upewnij się, że ta zależność działa poprawnie

router = APIRouter(prefix="/friends", tags=["friends"])

# Model wyjściowy przyjaciela
class Friend(BaseModel):
    id: int
    username: str
    avatar: Optional[str] = None

    class Config:
        orm_mode = True

# Model wejściowy przy dodawaniu przyjaciela
class FriendInput(BaseModel):
    username: str

# Endpoint do pobierania listy przyjaciół danego użytkownika
@router.get("/", response_model=List[Friend])
async def get_friends(
    user_id: int = Query(..., description="ID użytkownika, którego przyjaciół chcemy pobrać"),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    return user.friends

# Endpoint do dodawania przyjaciela
@router.post("/add", response_model=Friend)
async def add_friend(
    friend: FriendInput,
    user_id: int = Query(..., description="ID użytkownika dodającego przyjaciela"),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    # Wyszukujemy przyjaciela po username
    db_friend = db.query(User).filter(User.username == friend.username).first()
    if not db_friend:
        raise HTTPException(status_code=404, detail="Znajomy nie został znaleziony")
    if db_friend in user.friends:
        raise HTTPException(status_code=400, detail="Użytkownik już jest dodany")
    if db_friend.id == user_id:
        raise HTTPException(status_code=400, detail="Nie można dodać samego siebie")
    user.friends.append(db_friend)
    db.commit()
    db.refresh(db_friend)
    return db_friend

# Model do wyszukiwania użytkowników
class UserSearch(BaseModel):
    id: int
    username: str
    avatar: Optional[str] = None

    class Config:
        orm_mode = True

@router.get("/search", response_model=List[UserSearch])
async def search_users(
    search: str = Query(..., description="Fraza do wyszukiwania użytkowników po nazwie"),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.username.ilike(f"%{search}%")).all()
    return users
