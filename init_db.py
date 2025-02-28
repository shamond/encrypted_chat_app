# init_db.py
from app.db.base import Base
from app.db.session import engine
import app.models  # import modeli, aby zarejestrować je w Base.metadata

def init_db():
    # Utworzy wszystkie tabele, jeśli jeszcze nie istnieją
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
