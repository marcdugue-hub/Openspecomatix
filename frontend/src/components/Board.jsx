import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EventIcon from "@mui/icons-material/Event";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import Column, { COLUMN_DROPPABLE_PREFIX } from "./Column";
import CardModal from "./CardModal";
import { COLUMNS, DEFAULT_COLUMN, NEW_CARD_DEFAULT_TITLE } from "../constants";
import { computeNewPosition } from "../utils/position";
import { isOverdue, formatDueDate } from "../utils/date";
import {
  getCards,
  createCard,
  updateCard,
  deleteCard,
  ApiError,
} from "../api/cards";

function describeError(err) {
  if (err instanceof ApiError) {
    if (err.status === 0) return err.message;
    const detail = err.detail?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((d) => d.msg || JSON.stringify(d))
        .join(" ");
    }
    return `Erreur serveur (${err.status}).`;
  }
  return "Une erreur inattendue est survenue.";
}

export default function Board() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [modalCardId, setModalCardId] = useState(null);
  const [autoEditId, setAutoEditId] = useState(null);
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCards()
      .then((data) => {
        if (!cancelled) setCards(data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(describeError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cardsByColumn = useMemo(() => {
    const grouped = {};
    for (const col of COLUMNS) grouped[col] = [];
    for (const card of cards) {
      const target = grouped[card.column] ? card.column : DEFAULT_COLUMN;
      grouped[target].push(card);
    }
    for (const col of COLUMNS) {
      grouped[col].sort((a, b) => a.position - b.position);
    }
    return grouped;
  }, [cards]);

  const activeCard = useMemo(
    () => cards.find((c) => c.id === activeId) || null,
    [cards, activeId]
  );

  const modalCard = useMemo(
    () => cards.find((c) => c.id === modalCardId) || null,
    [cards, modalCardId]
  );

  // Story 7 + 8 : bouton unique "+ Nouvelle carte" -> apparaît dans "En exploration".
  const handleCreateCard = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createCard({ title: NEW_CARD_DEFAULT_TITLE });
      setCards((prev) => [...prev, created]);
      // Story 9 : édition inline du titre déclenchée juste après la création.
      setAutoEditId(created.id);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setCreating(false);
    }
  }, []);

  // Story 11 : icône crayon -> édition inline du titre (PATCH title uniquement).
  const handleInlineTitleSave = useCallback(
    async (id, title) => {
      const previous = cards.find((c) => c.id === id);
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
      try {
        const updated = await updateCard(id, { title });
        setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
        setAutoEditId((current) => (current === id ? null : current));
      } catch (err) {
        if (previous) {
          setCards((prev) => prev.map((c) => (c.id === id ? previous : c)));
        }
        throw err;
      }
    },
    [cards]
  );

  const handleOpenModal = useCallback((id) => {
    setModalCardId(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalCardId(null);
  }, []);

  // Stories 13-20 : sauvegarde complète depuis la modale.
  const handleModalSave = useCallback(async (id, payload) => {
    const updated = await updateCard(id, payload);
    setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    setModalCardId(null);
  }, []);

  // Stories 21-22 : suppression définitive après confirmation.
  const handleDelete = useCallback(async (id) => {
    await deleteCard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
    setModalCardId(null);
  }, []);

  const findColumnForDroppableId = useCallback(
    (id) => {
      if (typeof id === "string" && id.startsWith(COLUMN_DROPPABLE_PREFIX)) {
        return id.slice(COLUMN_DROPPABLE_PREFIX.length);
      }
      const card = cards.find((c) => c.id === id);
      return card ? card.column : null;
    },
    [cards]
  );

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  // Déplace la carte visuellement entre colonnes pendant le survol
  // (le tri fin au sein d'une colonne est calculé au drop).
  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeCard = cards.find((c) => c.id === active.id);
    if (!activeCard) return;

    const overColumn = findColumnForDroppableId(over.id);
    if (!overColumn || overColumn === activeCard.column) return;

    setCards((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, column: overColumn } : c))
    );
  }

  // Stories 23-25 : déplacement inter/intra-colonne, persisté immédiatement.
  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedCard = cards.find((c) => c.id === active.id);
    if (!draggedCard) return;

    const overColumn = findColumnForDroppableId(over.id);
    if (!overColumn) return;

    const destColumnCards = cardsByColumn[overColumn].filter(
      (c) => c.id !== active.id
    );

    let targetIndex = destColumnCards.length;
    if (over.id !== active.id) {
      const overIndex = destColumnCards.findIndex((c) => c.id === over.id);
      if (overIndex !== -1) targetIndex = overIndex;
    }

    const newPosition = computeNewPosition(destColumnCards, targetIndex);

    if (draggedCard.column === overColumn && draggedCard.position === newPosition) {
      return;
    }

    const previousSnapshot = cards;
    setCards((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, column: overColumn, position: newPosition }
          : c
      )
    );

    try {
      const updated = await updateCard(active.id, {
        column: overColumn,
        position: newPosition,
      });
      setCards((prev) => prev.map((c) => (c.id === active.id ? updated : c)));
    } catch (err) {
      setCards(previousSnapshot);
      setError(describeError(err));
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <Box sx={{ maxWidth: "100%", px: { xs: 2, md: 4 }, pt: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Tableau Kanban
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCard}
          disabled={creating}
        >
          Nouvelle carte
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress color="primary" />
        </Stack>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 2,
            }}
          >
            {COLUMNS.map((column) => (
              <Column
                key={column}
                column={column}
                cards={cardsByColumn[column]}
                autoEditId={autoEditId}
                onInlineTitleSave={handleInlineTitleSave}
                onOpenModal={handleOpenModal}
              />
            ))}
          </Box>

          <DragOverlay>
            {activeCard ? <CardPreview card={activeCard} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <CardModal
        card={modalCard}
        open={Boolean(modalCard)}
        onClose={handleCloseModal}
        onSave={handleModalSave}
        onDelete={handleDelete}
      />
    </Box>
  );
}

// Aperçu figé de la carte affiché sous le curseur pendant le drag (DragOverlay).
function CardPreview({ card }) {
  const overdue = isOverdue(card.due_date, card.column);
  return (
    <Paper
      elevation={4}
      sx={{
        p: 1.25,
        width: 260,
        bgcolor: overdue ? (theme) => theme.custom.overdueBg : "background.paper",
        borderLeft: "4px solid",
        borderLeftColor: overdue
          ? (theme) => theme.custom.overdueBorder
          : "transparent",
        cursor: "grabbing",
      }}
    >
      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>
        {card.title}
      </Typography>
      {card.assignee_name && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
          <PersonOutlineIcon fontSize="inherit" sx={{ color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {card.assignee_name}
          </Typography>
        </Stack>
      )}
      {card.due_date && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
          <EventIcon fontSize="inherit" sx={{ color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {formatDueDate(card.due_date)}
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}
