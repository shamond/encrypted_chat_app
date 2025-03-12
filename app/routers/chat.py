import datetime
import json
from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Message as MessageModel, Conversation, User
from app.routers.auth import get_db, decode_access_token

router = APIRouter(prefix="/chat", tags=["chat"])


# Klasa do zarządzania połączeniami WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}  # conversation_id -> [websocket1, websocket2, ...]

    async def connect(self, websocket: WebSocket, conversation_id: int):
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: int):
        if conversation_id in self.active_connections:
            if websocket in self.active_connections[conversation_id]:
                self.active_connections[conversation_id].remove(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def broadcast(self, message: dict, conversation_id: int):
        if conversation_id in self.active_connections:
            for connection in self.active_connections[conversation_id]:
                try:
                    # Upewnij się, że wiadomość ma pole "type"
                    if "type" not in message:
                        message["type"] = "message"

                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Błąd wysyłania przez WebSocket: {str(e)}")
                    self.disconnect(connection, conversation_id)


manager = ConnectionManager()


class Message(BaseModel):
    user_id: int
    conversation_id: Optional[int] = None
    recipient_id: Optional[int] = None
    content: str
    timestamp: float

    class Config:
        from_attributes = True


@router.get("/messages", response_model=List[Message])
async def get_messages(conversation_id: Optional[int] = None, db: Session = Depends(get_db)):
    if conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            return []  # Zwracamy pustą listę zamiast 404
        messages = db.query(MessageModel).filter(MessageModel.conversation_id == conversation_id).all()
        return messages
    return []


@router.post("/messages")
async def post_message(message: Message, db: Session = Depends(get_db)):
    conversation = None

    if message.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == message.conversation_id).first()

    if not conversation:
        # Tworzenie konwersacji przy pierwszej wiadomości
        sender = db.query(User).filter(User.id == message.user_id).first()
        recipient = db.query(User).filter(User.id == message.recipient_id).first()

        if not sender or not recipient:
            raise HTTPException(status_code=404, detail="Nie znaleziono użytkownika nadawcy lub odbiorcy")

        conversation = Conversation(is_group=False)
        conversation.participants = [sender, recipient]
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        message.conversation_id = conversation.id

    new_message = MessageModel(
        text=message.content,
        timestamp=datetime.datetime.utcnow(),
        user_id=message.user_id,
        conversation_id=message.conversation_id
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return {"status": "Wiadomość zapisana", "conversation_id": conversation.id}


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    token = websocket.query_params.get("token")
    print(f"Próba połączenia WebSocket. Otrzymany token: {token}")

    if not token:
        print("Brak tokena! Odrzucam połączenie WebSocket.")
        await websocket.close(code=403)
        return

    try:
        payload = decode_access_token(token)
        print(f"Token poprawnie zdekodowany: {payload}")
        user_email = payload.get("sub")
    except Exception as e:
        print(f"Błąd dekodowania tokena: {str(e)}")
        await websocket.close(code=403)
        return

    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        print(f"Użytkownik nie znaleziony dla email: {user_email}")
        await websocket.close(code=403)
        return

    await websocket.accept()
    print(f"WebSocket otwarty dla użytkownika: {user_email}")

    current_conversation_id = None

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # ---------------------------
            # 1) Obsługa dołączania
            # ---------------------------
            if message_data.get("type") == "join":
                current_conversation_id = message_data["conversation_id"]
                await manager.connect(websocket, current_conversation_id)
                print(f"Użytkownik {user.id} dołączył do konwersacji {current_conversation_id}")

                # Pobierz historię wiadomości i wyślij tylko do tej jednej osoby
                conversation_messages = db.query(MessageModel).filter(
                    MessageModel.conversation_id == current_conversation_id
                ).order_by(MessageModel.timestamp).all()

                history_payload = {
                    "type": "history",
                    "messages": [
                        {
                            "id": msg.id,
                            "text": msg.text,
                            "user_id": msg.user_id,
                            "timestamp": msg.timestamp.isoformat()
                        }
                        for msg in conversation_messages
                    ]
                }
                await websocket.send_text(json.dumps(history_payload))

            # ---------------------------
            # 2) Obsługa nowej wiadomości
            # ---------------------------
            # W endpoincie WebSocket, obsługa nowej wiadomości
            elif message_data.get("type") == "message":
                # Załóżmy, że front wysyła "conversation_id" oraz "text"
                conversation_id = message_data["conversation_id"]
                text = message_data["text"]

                # Zapis do bazy
                new_message = MessageModel(
                    text=text,
                    timestamp=datetime.datetime.utcnow(),
                    user_id=user.id,  # user z tokena
                    conversation_id=conversation_id
                )
                db.add(new_message)
                db.commit()
                db.refresh(new_message)
                chat
                # Broadcast do wszystkich w konwersacji
                broadcast_message = {
                    "type": "message",  # Dodaj typ dla jasności
                    "id": new_message.id,
                    "text": new_message.text,
                    "user_id": new_message.user_id,
                    "conversation_id": new_message.conversation_id,
                    "timestamp": new_message.timestamp.isoformat()
                }
                await manager.broadcast(broadcast_message, conversation_id)
                print(f"Wiadomość od {user.id} rozgłoszona do konwersacji {conversation_id}")

            # dodać inne typy obsługi, np. "leave", "user_typing" itp.
            # else:
            #     print("Nieznany typ wiadomości")


    except WebSocketDisconnect:
        if current_conversation_id is not None:
            print(f"Użytkownik {user.id} rozłączył się, usuwam z konwersacji {current_conversation_id}")
            manager.disconnect(websocket, current_conversation_id)
        return

    except Exception as e:
        print(f"Błąd WebSocket: {str(e)}")
        if current_conversation_id is not None:
            manager.disconnect(websocket, current_conversation_id)