import { DONE_COLUMN } from "../constants";

/**
 * `due_date` est une date seule (sans heure), au format "YYYY-MM-DD" côté API
 * (compatible avec <input type="date">).
 */

function todayDateOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  // Évite les décalages de fuseau horaire en parsant Y/M/D explicitement
  // plutôt que de laisser `new Date(dateStr)` interpréter en UTC.
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/**
 * Une carte est en retard si sa `due_date` est strictement dans le passé et
 * qu'elle n'est pas dans la colonne "Terminé" (story 6).
 */
export function isOverdue(dueDate, column) {
  if (!dueDate) return false;
  if (column === DONE_COLUMN) return false;
  const due = parseDateOnly(dueDate);
  if (!due) return false;
  return due.getTime() < todayDateOnly().getTime();
}

/**
 * Formatage lisible en français pour l'affichage sur la carte / dans la modale.
 */
export function formatDueDate(dueDate) {
  const due = parseDateOnly(dueDate);
  if (!due) return "";
  return due.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formatage lisible en français d'un horodatage complet (`created_at`, `updated_at`).
 */
export function formatTimestamp(isoTimestamp) {
  if (!isoTimestamp) return "";
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
