from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.models import Conversation, User
from app.routers.auth import get_db

router = APIRouter(prefix="/conversations", tags=["conversations"])

class Participant(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: int
    name: Optional[str] = None
    is_group: bool
    created_at: datetime
    last_updated: Optional[datetime] = None
    participants: List[Participant]

    class Config:
        from_attributes = True

@router.get("/private", response_model=ConversationOut)
async def get_private_conversation(
    user1: int = Query(..., description="ID pierwszego użytkownika"),
    user2: int = Query(..., description="ID drugiego użytkownika"),
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.is_group == False)
        .filter(Conversation.participants.any(User.id == user1))
        .filter(Conversation.participants.any(User.id == user2))
        .first()
    )
    if not conversation:
        user1_obj = db.query(User).filter(User.id == user1).first()
        user2_obj = db.query(User).filter(User.id == user2).first()
        if not user1_obj or not user2_obj:
            raise HTTPException(status_code=404, detail="Jeden z użytkowników nie został znaleziony")
        conversation = Conversation(is_group=False, name=None)
        conversation.participants = [user1_obj, user2_obj]
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    return conversation

@router.get("/", response_model=List[ConversationOut])
async def get_conversations(
    user_id: int = Query(..., description="ID użytkownika, dla którego pobieramy konwersacje"),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie został znaleziony")
    conversations = user.conversations
    conversations = sorted(conversations, key=lambda conv: conv.last_updated or conv.created_at, reverse=True)
    return conversations
