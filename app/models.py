# Modele danych oparte na Pydantic oraz (opcjonalnie) modele ORM
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

# Tabela asocjacyjna dla znajomych (relacja wiele-do-wielu między użytkownikami)
friendship_table = Table(
    "friendships",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("friend_id", Integer, ForeignKey("users.id"), primary_key=True)
)

# Tabela asocjacyjna dla uczestników rozmowy (w przypadku czatów grupowych)
conversation_participants = Table(
    "conversation_participants",
    Base.metadata,
    Column("conversation_id", Integer, ForeignKey("conversations.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacja dla znajomych (opcjonalnie)
    friends = relationship(
        "User",
        secondary=friendship_table,
        primaryjoin=id==friendship_table.c.user_id,
        secondaryjoin=id==friendship_table.c.friend_id,
        backref="friend_of"
    )
    # Relacja do rozmów (wiele-do-wielu)
    conversations = relationship(
        "Conversation",
        secondary=conversation_participants,
        back_populates="participants"
    )
    # Relacja do wysłanych wiadomości
    messages = relationship("Message", back_populates="user")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)  # Nazwa czatu grupowego; dla rozmów jeden-na-jeden może być None
    is_group = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Uczestnicy rozmowy
    participants = relationship(
        "User",
        secondary=conversation_participants,
        back_populates="conversations"
    )
    # Wiadomości w rozmowie
    messages = relationship("Message", back_populates="conversation")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    conversation = relationship("Conversation", back_populates="messages")
    user = relationship("User", back_populates="messages")
