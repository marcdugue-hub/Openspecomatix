import { useEffect, useRef, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EventIcon from "@mui/icons-material/Event";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { isOverdue, formatDueDate } from "../utils/date";

// Vue "carte" du tableau (story 4, 5, 6, 11, 12).
export default function CardItem({ card, autoEdit, onInlineTitleSave, onOpenModal }) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(card.title);
  const [titleError, setTitleError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: editing });

  const overdue = isOverdue(card.due_date, card.column);

  // Story 9 : édition inline auto-déclenchée juste après la création.
  useEffect(() => {
    if (autoEdit) {
      setDraftTitle(card.title);
      setTitleError("");
      setEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEdit]);

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing]);

  function startEditing(e) {
    e?.stopPropagation();
    setDraftTitle(card.title);
    setTitleError("");
    setEditing(true);
  }

  function cancelEditing() {
    setDraftTitle(card.title);
    setTitleError("");
    setEditing(false);
  }

  async function commitEditing() {
    const trimmed = draftTitle.trim();
    // Story 10 : sauvegarde bloquée tant que le titre est vide.
    if (!trimmed) {
      setTitleError("Le titre ne peut pas être vide.");
      return;
    }
    setSaving(true);
    try {
      await onInlineTitleSave(card.id, trimmed);
      setEditing(false);
    } catch (err) {
      setTitleError("Échec de la sauvegarde, réessayez.");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEditing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(editing ? {} : listeners)}
      onDoubleClick={() => !editing && onOpenModal(card.id)}
      elevation={1}
      sx={{
        p: 1.25,
        cursor: editing ? "default" : "grab",
        bgcolor: overdue ? (theme) => theme.custom.overdueBg : "background.paper",
        borderLeft: "4px solid",
        borderLeftColor: overdue
          ? (theme) => theme.custom.overdueBorder
          : "transparent",
        "&:hover .card-edit-icon": { opacity: 1 },
      }}
    >
      {editing ? (
        <Stack spacing={0.5}>
          <TextField
            inputRef={inputRef}
            value={draftTitle}
            size="small"
            variant="standard"
            disabled={saving}
            error={Boolean(titleError)}
            onChange={(e) => {
              setDraftTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            fullWidth
          />
          {titleError && (
            <Typography variant="caption" color="error">
              {titleError}
            </Typography>
          )}
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                commitEditing();
              }}
              disabled={saving}
              aria-label="Valider le titre"
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                cancelEditing();
              }}
              disabled={saving}
              aria-label="Annuler l'édition du titre"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={0.5}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ wordBreak: "break-word", pr: 1 }}
            >
              {card.title}
            </Typography>
            <IconButton
              className="card-edit-icon"
              size="small"
              onClick={startEditing}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Éditer le titre"
              sx={{ opacity: 0.4, transition: "opacity 120ms ease", flexShrink: 0 }}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Stack>
          {card.assignee_name && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PersonOutlineIcon
                fontSize="inherit"
                sx={{ color: "text.secondary" }}
              />
              <Typography variant="caption" color="text.secondary">
                {card.assignee_name}
              </Typography>
            </Stack>
          )}
          {card.due_date && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <EventIcon
                fontSize="inherit"
                sx={{
                  color: overdue
                    ? (theme) => theme.custom.overdueBorder
                    : "text.secondary",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: overdue
                    ? (theme) => theme.custom.overdueBorder
                    : "text.secondary",
                  fontWeight: overdue ? 700 : 400,
                }}
              >
                {formatDueDate(card.due_date)}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}
    </Paper>
  );
}
