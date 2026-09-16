// Les 7 colonnes fixes du cycle de vie (PRD - Solution / Modèle de données `Card`).
// L'ordre ici définit l'ordre d'affichage du tableau.
export const COLUMNS = [
  "En exploration",
  "Backlog",
  "À spécifier",
  "À développer",
  "À recetter",
  "À déployer",
  "Terminé",
];

// Colonne par défaut pour toute carte nouvellement créée.
export const DEFAULT_COLUMN = "En exploration";

// Colonne dans laquelle l'indicateur "en retard" ne s'applique jamais.
export const DONE_COLUMN = "Terminé";

// Titre par défaut affecté à une carte à la création, immédiatement
// remplacé via l'édition inline du titre (story 9).
export const NEW_CARD_DEFAULT_TITLE = "Nouvelle carte";
