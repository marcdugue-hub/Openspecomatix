"""Configuration de la connexion SQLite et de la session SQLAlchemy.

L'URL de la base est lue depuis la variable d'environnement ``DATABASE_URL``.
En l'absence de cette variable, on utilise un fichier SQLite local
(``data.db``) afin que les cartes soient conservées entre deux redémarrages
du serveur. Les tests définissent ``DATABASE_URL=sqlite://`` (base en
mémoire) avant d'importer ce module pour isoler complètement leurs données.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./data.db")

_engine_kwargs = {"connect_args": {"check_same_thread": False}}

if DATABASE_URL == "sqlite://":
    # Base SQLite en mémoire : toutes les connexions doivent partager la
    # même base, sans quoi chaque session verrait une base vide différente.
    _engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **_engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency FastAPI fournissant une session DB par requête."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
