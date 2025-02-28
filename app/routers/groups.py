# Endpointy związane z wiadomościami i obsługą chatu (Chat.js, ChatInput.js, ChatMessage.js)
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/groups", tags=["groups"])

class GroupChat(BaseModel):
    group_name: str
    members: List[str]

# Przykładowe przechowywanie grup – docelowo baza danych
group_chats: List[GroupChat] = []

@router.post("/create")
async def create_group_chat(group: GroupChat):
    # Dodaj tutaj walidację oraz logikę tworzenia grupy
    group_chats.append(group)
    return {"status": "Grupa czatu utworzona"}