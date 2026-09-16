"""Fixtures pytest partagées : base SQLite de test en mémoire.

Suit la décision de test du PRD : `TestClient` de FastAPI, frappant une
vraie base SQLite dédiée aux tests, réinitialisée entre chaque test (pas de
mock de la couche SQLite).

`DATABASE_URL` est fixée à une base SQLite en mémoire *avant* le premier
import de `app.database` / `app.main`, afin que le moteur SQLAlchemy créé
par l'application pointe directement vers cette base de test (pas de
dependency_override nécessaire).
"""

import os

os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
def reset_database():
    """Recrée un schéma vide avant chaque test, le détruit après."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)
