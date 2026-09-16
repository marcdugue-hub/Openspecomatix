"""Routes CRUD pour les cartes du tableau Kanban.

Contrat respecté strictement selon le PRD (docs/prd-kanban-v1.md) :

- GET /cards            -> liste toutes les cartes (tous champs).
- POST /cards           -> crée une carte ; seul `title` est requis ;
                            `column` est forcée à "En exploration" et
                            `position` calculée en fin de colonne.
- PATCH /cards/{id}     -> mise à jour partielle (titre, responsable,
                            échéance, description, colonne, position) ;
                            utilisée aussi bien pour l'édition modale que
                            pour un déplacement drag & drop.
- DELETE /cards/{id}    -> suppression définitive ; 404 si id inconnu.
"""

from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..models import utcnow

router = APIRouter(prefix="/cards", tags=["cards"])


def _get_card_or_404(db: Session, card_id: str) -> models.Card:
    card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    return card


@router.get("", response_model=List[schemas.CardResponse])
def list_cards(db: Session = Depends(get_db)):
    """Liste toutes les cartes, tous champs inclus (y compris description)."""
    return db.query(models.Card).order_by(models.Card.column, models.Card.position).all()


@router.post("", response_model=schemas.CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(payload: schemas.CardCreate, db: Session = Depends(get_db)):
    """Crée une carte, toujours dans la colonne "En exploration"."""
    max_position = (
        db.query(func.max(models.Card.position))
        .filter(models.Card.column == models.DEFAULT_COLUMN)
        .scalar()
    )
    new_position = (max_position + 1.0) if max_position is not None else 0.0

    now = utcnow()
    card = models.Card(
        id=str(uuid4()),
        title=payload.title,
        assignee_name=payload.assignee_name,
        due_date=payload.due_date,
        description=payload.description,
        column=models.DEFAULT_COLUMN,
        lane=models.DEFAULT_LANE,
        position=new_position,
        created_at=now,
        updated_at=now,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.patch("/{card_id}", response_model=schemas.CardResponse)
def update_card(card_id: str, payload: schemas.CardUpdate, db: Session = Depends(get_db)):
    """Mise à jour partielle d'une carte (édition modale ou drag & drop)."""
    card = _get_card_or_404(db, card_id)

    update_data = payload.model_dump(exclude_unset=True)

    if "title" in update_data:
        title_value = update_data["title"]
        if title_value is None or not str(title_value).strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="title must not be empty",
            )

    for field, value in update_data.items():
        setattr(card, field, value)

    card.updated_at = utcnow()

    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(card_id: str, db: Session = Depends(get_db)):
    """Supprime définitivement une carte. 404 si l'id n'existe pas."""
    card = _get_card_or_404(db, card_id)
    db.delete(card)
    db.commit()
    return None
