# Endpointy związane z wiadomościami i obsługą chatu (Chat.js, ChatInput.js, ChatMessage.js)
import datetime
from fastapi import APIRouter, WebSocket, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Message as MessageModel  # model ORM
from app.routers.auth import get_db  # lub zdefiniuj własne get_db

router = APIRouter(prefix="/chat", tags=["chat"])

# Definiujemy schemat Pydantic, który będzie używany do walidacji danych wejściowych i wyjściowych.
# Zakładamy, że do wysłania wiadomości użytkownik poda swoje ID oraz treść wiadomości
class Message(BaseModel):
    user_id: int
    conversation_id : int
    content: str
    timestamp: float  # Możesz również użyć datetime
    class Config:
        orm_mode = True

# Przykładowe przechowywanie wiadomości (w pamięci lub w bazie danych)
chat_history: List[Message] = []

@router.get("/messages", response_model=List[Message])
async def get_messages(db: Session = Depends(get_db)):
    messages = db.query(Message).all()
    return messages

@router.post("/messages")
async def post_message(message: Message, db: Session = Depends(get_db)):
    new_message = MessageModel(
        text = message.content,
        timestamp = datetime.datetime.utcnow(),
        user_id = message.user_id,
        conversation_id = message.conversation_id
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return {"status": "Wiadomość zapisana"}


# Endpoint WebSocket – zakładamy, że klient wysyła dane w formacie JSON zawierające user_id, conversation_id oraz content
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_text("Błąd: Nieprawidłowy format JSON")
                continue

            # Utwórz wiadomość na podstawie przesłanych danych
            new_message = MessageModel(
                text=message_data.get("content"),
                timestamp=datetime.datetime.utcnow(),
                user_id=message_data.get("user_id"),
                conversation_id=message_data.get("conversation_id")
            )
            db.add(new_message)
            db.commit()
            # Możesz dodać logikę broadcastu do innych klientów, jeżeli potrzebujesz
            await websocket.send_text(f"Odebrano: {data}")
    except Exception as e:
        await websocket.close()
