"""Modèle SQL de la carte (`Card`) du tableau Kanban."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, Float, String

from .database import Base

DEFAULT_COLUMN = "En exploration"
DEFAULT_LANE = "default"


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Card(Base):
    __tablename__ = "cards"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    assignee_name = Column(String, nullable=True)
    due_date = Column(Date, nullable=True)
    description = Column(String, nullable=True)
    column = Column(String, nullable=False, default=DEFAULT_COLUMN)
    lane = Column(String, nullable=False, default=DEFAULT_LANE)
    position = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, nullable=False, default=utcnow)
    updated_at = Column(DateTime, nullable=False, default=utcnow, onupdate=utcnow)
