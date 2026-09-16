"""Schémas Pydantic pour les requêtes/réponses de l'API `cards`.

Volontairement séparés du modèle SQL (`models.Card`) comme décrit dans le
PRD, afin de contrôler précisément ce qui est accepté en entrée et renvoyé
en sortie par l'API.
"""

import enum
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class BoardColumn(str, enum.Enum):
    """Les 7 colonnes fixes du cycle de vie d'un sujet."""

    EN_EXPLORATION = "En exploration"
    BACKLOG = "Backlog"
    A_SPECIFIER = "À spécifier"
    A_DEVELOPPER = "À développer"
    A_RECETTER = "À recetter"
    A_DEPLOYER = "À déployer"
    TERMINE = "Terminé"


def _validate_title_not_blank(value: str) -> str:
    if value is None or not value.strip():
        raise ValueError("title must not be empty")
    return value


class CardCreate(BaseModel):
    """Corps de requête pour `POST /cards`.

    Seul `title` est requis ; `column`, `position`, `lane`, `id`,
    `created_at` et `updated_at` sont toujours déterminés côté serveur et
    n'apparaissent donc pas dans ce schéma.
    """

    title: str
    assignee_name: Optional[str] = None
    due_date: Optional[date] = None
    description: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, v: str) -> str:
        return _validate_title_not_blank(v)


class CardUpdate(BaseModel):
    """Corps de requête pour `PATCH /cards/{id}`.

    Tous les champs sont optionnels : seuls ceux explicitement fournis dans
    la requête sont appliqués (mise à jour partielle). `created_at` n'est
    jamais accepté en entrée ; `updated_at` est toujours recalculé côté
    serveur, quel que soit le contenu de la requête.
    """

    title: Optional[str] = None
    assignee_name: Optional[str] = None
    due_date: Optional[date] = None
    description: Optional[str] = None
    column: Optional[BoardColumn] = None
    position: Optional[float] = None

    model_config = ConfigDict(use_enum_values=True)


class CardResponse(BaseModel):
    """Représentation complète d'une carte renvoyée par l'API."""

    id: str
    title: str
    assignee_name: Optional[str] = None
    due_date: Optional[date] = None
    description: Optional[str] = None
    column: BoardColumn
    lane: str
    position: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
