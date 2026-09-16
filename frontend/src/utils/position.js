// Indexation fractionnée pour l'ordre manuel des cartes au sein d'une colonne
// (PRD - modèle de données `Card`, champ `position`).
//
// Plutôt que de renuméroter toute la colonne à chaque drag & drop, on calcule
// une nouvelle valeur de `position` comprise entre les deux cartes voisines.

const GAP = 1000;

/**
 * Position à attribuer si la carte est déposée en tête de colonne.
 * @param {number|undefined} firstPosition position de la carte actuellement en tête (ou undefined si colonne vide)
 */
export function positionAtStart(firstPosition) {
  if (firstPosition === undefined || firstPosition === null) return GAP;
  return firstPosition - GAP;
}

/**
 * Position à attribuer si la carte est déposée en fin de colonne.
 * @param {number|undefined} lastPosition position de la carte actuellement en queue (ou undefined si colonne vide)
 */
export function positionAtEnd(lastPosition) {
  if (lastPosition === undefined || lastPosition === null) return GAP;
  return lastPosition + GAP;
}

/**
 * Position à attribuer si la carte est déposée entre deux voisines.
 * @param {number|null|undefined} prevPosition position de la voisine précédente (null si aucune -> tête de colonne)
 * @param {number|null|undefined} nextPosition position de la voisine suivante (null si aucune -> fin de colonne)
 */
export function positionBetween(prevPosition, nextPosition) {
  const hasPrev = prevPosition !== undefined && prevPosition !== null;
  const hasNext = nextPosition !== undefined && nextPosition !== null;
  if (!hasPrev && !hasNext) return GAP;
  if (!hasPrev) return nextPosition - GAP;
  if (!hasNext) return prevPosition + GAP;
  return (prevPosition + nextPosition) / 2;
}

/**
 * Calcule la nouvelle position d'une carte déplacée à `targetIndex` au sein
 * d'une liste de cartes déjà triées par position (la carte déplacée exclue
 * de cette liste).
 * @param {Array<{position: number}>} sortedCards cartes de la colonne cible, triées par position, sans la carte déplacée
 * @param {number} targetIndex index d'insertion souhaité
 */
export function computeNewPosition(sortedCards, targetIndex) {
  if (sortedCards.length === 0) return GAP;
  if (targetIndex <= 0) return positionAtStart(sortedCards[0]?.position);
  if (targetIndex >= sortedCards.length) {
    return positionAtEnd(sortedCards[sortedCards.length - 1]?.position);
  }
  const prev = sortedCards[targetIndex - 1];
  const next = sortedCards[targetIndex];
  return positionBetween(prev.position, next.position);
}
