"""Point d'entrée FastAPI : montage du router `cards` et configuration CORS.

Lancement en dev local : `uvicorn app.main:app --reload` depuis `backend/`.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import cards

# Crée les tables au démarrage si elles n'existent pas encore (persistance
# SQLite entre deux redémarrages du serveur, cf. user story 26 du PRD).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Openspecomatix Kanban API")

# Origines du front en dev local (Vite : http://localhost:5173 par défaut).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cards.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
