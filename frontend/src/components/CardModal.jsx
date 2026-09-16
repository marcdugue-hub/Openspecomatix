import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { formatTimestamp } from "../utils/date";

// Modale d'édition complète (stories 12-22).
export default function CardModal({ card, open, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      setAssigneeName(card.assignee_name || "");
      setDueDate(card.due_date || "");
      setDescription(card.description || "");
      setTitleError("");
      setSaveError("");
      setConfirmDeleteOpen(false);
      setDeleteError("");
    }
  }, [card]);

  if (!card) return null;

  const isTitleEmpty = title.trim().length === 0;

  function handleTitleChange(e) {
    setTitle(e.target.value);
    if (e.target.value.trim().length > 0) setTitleError("");
  }

  async function handleSave() {
    // Story 17 : bouton Sauvegarder désactivé + message d'erreur si titre vide.
    if (isTitleEmpty) {
      setTitleError("Le titre ne peut pas être vide.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await onSave(card.id, {
        title: title.trim(),
        // Story 20 : responsable et échéance peuvent rester vides.
        assignee_name: assigneeName.trim() ? assigneeName.trim() : null,
        due_date: dueDate ? dueDate : null,
        description: description ? description : null,
      });
    } catch (err) {
      setSaveError("Échec de la sauvegarde. Vérifiez les champs et réessayez.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete(card.id);
    } catch (err) {
      setDeleteError("Échec de la suppression. Réessayez.");
      setDeleting(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Modifier la carte</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Titre"
              value={title}
              onChange={handleTitleChange}
              error={Boolean(titleError)}
              helperText={titleError || " "}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Responsable"
              value={assigneeName}
              onChange={(e) => setAssigneeName(e.target.value)}
              fullWidth
              placeholder="Nom (optionnel)"
            />
            <TextField
              label="Échéance"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={4}
              placeholder="Détails du sujet (optionnel)"
            />
            <TextField
              label="Créée le"
              value={formatTimestamp(card.created_at)}
              fullWidth
              disabled
            />
            {saveError && <Alert severity="error">{saveError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Button
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={saving}
          >
            Supprimer
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || isTitleEmpty}
            >
              Sauvegarder
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Supprimer cette carte ?</DialogTitle>
        <DialogContent>
          <Typography>
            Cette action est définitive et ne peut pas être annulée.
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
