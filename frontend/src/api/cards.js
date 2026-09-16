// Client HTTP pour l'API REST des cartes.
//
// Contrat suivi STRICTEMENT depuis docs/prd-kanban-v1.md - section "API — contrat" :
//   GET    /cards         -> liste toutes les cartes (tous champs, y compris description)
//   POST   /cards         -> crée une carte ; seul `title` est requis
//   PATCH  /cards/{id}    -> mise à jour partielle (title, assignee_name, due_date,
//                            description, column, position) ; utilisé aussi bien pour
//                            l'édition modale que pour le drag & drop
//   DELETE /cards/{id}    -> supprime définitivement ; 404 si id inconnu
//
// `created_at` n'est jamais envoyé en entrée ; `updated_at` est recalculé côté serveur.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(status, detail) {
    super(`Erreur API (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (networkError) {
    throw new ApiError(0, "Impossible de contacter le serveur.");
  }

  if (!response.ok) {
    let detail = null;
    try {
      detail = await response.json();
    } catch {
      // pas de corps JSON exploitable
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** GET /cards */
export function getCards() {
  return request("/cards", { method: "GET" });
}

/**
 * POST /cards
 * @param {{title: string, assignee_name?: string, due_date?: string, description?: string}} payload
 */
export function createCard(payload) {
  return request("/cards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * PATCH /cards/{id}
 * @param {string} id
 * @param {Partial<{title: string, assignee_name: string, due_date: string|null, description: string, column: string, position: number}>} payload
 */
export function updateCard(id, payload) {
  return request(`/cards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** DELETE /cards/{id} */
export function deleteCard(id) {
  return request(`/cards/${id}`, { method: "DELETE" });
}
