from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth  # import innych routerów, jeśli są
from app.routers import friends
from app.routers import users
from app.routers import conversation
from app.routers import chat
app = FastAPI()

# Konfiguracja CORS
origins = [
    "http://localhost:3000",
    # możesz dodać więcej adresów, jeśli potrzebujesz
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # zezwól na zapytania z frontendu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Włączenie routera z endpointami logowania/rejestracji
app.include_router(auth.router)
app.include_router(friends.router)
app.include_router(conversation.router)
app.include_router(chat.router)