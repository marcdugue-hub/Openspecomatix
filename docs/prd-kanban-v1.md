# PRD — Tableau de management visuel (Kanban) v1

## Problem Statement

Un utilisateur qui pilote des sujets (produit, technique, exploration) a besoin de visualiser où en est chaque sujet dans son cycle de vie — de l'idée encore floue ("en exploration") jusqu'à sa mise en production ("terminé") — sans avoir à ouvrir un outil lourd ou à maintenir un tableur.

Il veut pouvoir :
- voir d'un coup d'œil tous les sujets en cours et leur étape actuelle,
- déplacer un sujet d'une étape à l'autre aussi simplement que de glisser une carte,
- savoir qui est responsable de chaque sujet et s'il y a une échéance à respecter,
- repérer immédiatement les sujets en retard,
- garder une note plus détaillée sur chaque sujet sans polluer la vue d'ensemble.

Aujourd'hui, aucun outil de ce type n'existe dans ce repo : il n'y a ni back, ni front, ni modèle de données.

## Solution

Construire une application web de tableau visuel de type Kanban, avec une séparation claire entre :
- un **back Python** (FastAPI + SQLite) exposant une API REST pour gérer les cartes,
- un **front React** (Vite + MUI, thème aux couleurs chaudes et rassurantes) consommant cette API.

Le tableau affiche 7 colonnes fixes représentant le cycle de vie d'un sujet : *En exploration*, *Backlog*, *À spécifier*, *À développer*, *À recetter*, *À déployer*, *Terminé*. Chaque sujet est une carte, déplaçable par glisser-déposer entre colonnes et à l'intérieur d'une colonne. Une carte porte un titre, un nom de responsable (texte libre), une échéance, une description longue, et une date de création non modifiable. La création et l'édition de carte sont pensées pour être rapides (édition inline du titre, modale complète pour le reste).

Cette v1 est volontairement construite **sans** utiliser OpenSpec : elle sert de base de code réelle pour pratiquer ensuite, dans un exercice séparé, l'introduction d'OpenSpec sur une codebase existante ("brownfield").

## User Stories

**Affichage du tableau**

1. En tant qu'utilisateur du tableau, je veux voir les 7 colonnes fixes du cycle de vie (En exploration, Backlog, À spécifier, À développer, À recetter, À déployer, Terminé), afin de comprendre en un coup d'œil les étapes possibles d'un sujet.
2. En tant qu'utilisateur du tableau, je veux voir toutes les cartes existantes réparties dans leur colonne actuelle au chargement de la page, afin d'avoir une vue d'ensemble immédiate.
3. En tant qu'utilisateur du tableau, je veux voir le nombre de cartes affiché dans l'en-tête de chaque colonne, afin d'évaluer rapidement la charge de chaque étape.
4. En tant qu'utilisateur du tableau, je veux voir sur chaque carte son titre, le nom de la personne assignée et sa date d'échéance, afin d'avoir les informations essentielles sans ouvrir la carte.
5. En tant qu'utilisateur du tableau, je ne veux PAS voir la description multiligne dans la vue tableau, afin de garder les cartes lisibles et compactes.
6. En tant qu'utilisateur du tableau, je veux qu'une carte dont l'échéance est dépassée (et qui n'est pas dans la colonne Terminé) change visiblement de couleur, afin de repérer immédiatement les retards.

**Création de carte**

7. En tant qu'utilisateur du tableau, je veux un bouton unique "+ Nouvelle carte" au-dessus du tableau, afin de créer un nouveau sujet en un clic.
8. En tant qu'utilisateur du tableau, je veux qu'une carte nouvellement créée apparaisse automatiquement dans la colonne "En exploration", afin de respecter le cycle de vie prévu pour tout nouveau sujet.
9. En tant qu'utilisateur du tableau, je veux pouvoir éditer le titre directement en ligne juste après la création de la carte, afin de la nommer immédiatement sans ouvrir de modale.
10. En tant qu'utilisateur du tableau, je veux que la sauvegarde du titre soit bloquée tant qu'il est vide, avec un message d'erreur visible, afin de ne jamais avoir de carte sans titre.

**Édition du titre**

11. En tant qu'utilisateur du tableau, je veux une icône crayon sur chaque carte du tableau, afin de renommer rapidement son titre sans ouvrir la modale complète.
12. En tant qu'utilisateur du tableau, je veux pouvoir double-cliquer sur une carte pour ouvrir une modale d'édition complète (y compris le titre), afin de modifier tous les champs en une seule fois.

**Édition complète (modale)**

13. En tant qu'utilisateur du tableau, je veux, dans la modale d'édition, pouvoir modifier le titre, le nom du responsable, l'échéance et la description, afin de tenir la carte à jour.
14. En tant qu'utilisateur du tableau, je veux voir la date de création affichée dans la modale mais non modifiable, afin de garder une trace fiable de l'historique du sujet.
15. En tant qu'utilisateur du tableau, je veux un bouton "Sauvegarder" explicite dans la modale, afin de valider consciemment mes changements.
16. En tant qu'utilisateur du tableau, je veux un bouton "Annuler" dans la modale, afin de fermer sans appliquer mes changements.
17. En tant qu'utilisateur du tableau, je veux que le bouton Sauvegarder soit désactivé avec un message d'erreur tant que le titre est vide, afin de ne jamais enregistrer une carte invalide.
18. En tant qu'utilisateur du tableau, je veux pouvoir saisir une description sur plusieurs lignes dans la modale, afin de détailler le sujet sans limite de longueur artificielle.
19. En tant qu'utilisateur du tableau, je veux pouvoir choisir l'échéance via un sélecteur de date (jour/mois/année, sans heure), afin de fixer une date simplement.
20. En tant qu'utilisateur du tableau, je veux pouvoir laisser le nom du responsable et l'échéance vides, afin de créer rapidement une carte même sans toutes les informations.

**Suppression**

21. En tant qu'utilisateur du tableau, je veux un bouton "Supprimer" dans la modale d'édition, afin de retirer définitivement une carte devenue inutile.
22. En tant qu'utilisateur du tableau, je veux une confirmation avant suppression définitive, afin d'éviter une suppression accidentelle.

**Déplacement (drag & drop)**

23. En tant qu'utilisateur du tableau, je veux glisser-déposer une carte d'une colonne à une autre, afin de refléter l'avancement réel du sujet.
24. En tant qu'utilisateur du tableau, je veux glisser-déposer une carte pour la réordonner au sein de sa colonne actuelle, afin d'exprimer une priorité relative entre sujets d'une même étape.
25. En tant qu'utilisateur du tableau, je veux que le déplacement d'une carte soit immédiatement persisté, afin de ne pas perdre l'organisation du tableau après un rafraîchissement de la page.

**Persistance & fiabilité**

26. En tant qu'utilisateur du tableau, je veux que mes cartes soient conservées après un redémarrage du serveur, afin de ne pas perdre mon travail entre deux sessions.
27. En tant qu'utilisateur du tableau, je veux que chaque carte garde une trace de sa dernière date de modification, afin de préparer une future détection de conflits si plusieurs personnes éditent le tableau.

**Backend / API**

28. En tant que développeur du prototype, je veux une API REST exposant des opérations CRUD sur les cartes, afin que le front puisse lister, créer, modifier et supprimer des cartes de façon découplée.
29. En tant que développeur du prototype, je veux que l'API valide les données entrantes (ex: titre requis), afin de garantir l'intégrité des données stockées même en cas de bug côté front.
30. En tant que développeur du prototype, je veux des tests automatisés sur les endpoints de l'API, afin de détecter rapidement toute régression sur les opérations CRUD.

## Implementation Decisions

**Architecture générale**
- Séparation stricte back/front : back Python exposant une API REST HTTP, front React consommant cette API via `fetch`/`axios`. Aucun rendu serveur (SSR) — le front est une SPA.
- Exécution locale en deux process séparés pour ce prototype (`uvicorn` pour le back, `vite dev` pour le front), pas de conteneurisation ni de build de production pour la v1.

**Back — modules**
- `database.py` : configuration de la connexion SQLite (fichier `data.db`) et de la session.
- `models.py` : modèle de données `Card` (table SQL).
- `schemas.py` : schémas Pydantic pour les requêtes/réponses de l'API (séparés du modèle SQL).
- `routers/cards.py` (ou équivalent) : routes CRUD pour les cartes.
- `main.py` : point d'entrée FastAPI, montage du router, configuration CORS pour autoriser l'origine du front en dev local.

**Modèle de données `Card`**
- `id` : identifiant unique (UUID string), généré côté serveur à la création.
- `title` : chaîne, requis, non vide.
- `assignee_name` : chaîne monoligne, optionnelle (champ "nom").
- `due_date` : date seule (sans heure), optionnelle.
- `description` : texte multiligne, optionnel, jamais retourné/affiché dans une vue "résumé" du tableau (mais inclus dans la réponse API de la carte complète).
- `column` : chaîne contrainte à l'une des 7 valeurs fixes du cycle de vie (En exploration, Backlog, À spécifier, À développer, À recetter, À déployer, Terminé). Valeur par défaut à la création : "En exploration".
- `lane` : chaîne conservée dans le modèle pour anticiper de vraies swimlanes futures ; en v1 toujours fixée à une valeur unique par défaut (ex. `"default""`), non exposée dans l'UI.
- `position` : valeur numérique flottante utilisée pour l'ordre manuel des cartes au sein d'une même colonne (indexation fractionnée : une nouvelle position calculée entre les deux voisines lors d'un déplacement, pour éviter de renuméroter toute la colonne à chaque drag & drop).
- `created_at` : horodatage de création, généré côté serveur, jamais modifiable après création (non accepté en entrée sur les opérations de mise à jour).
- `updated_at` : horodatage mis à jour côté serveur à chaque modification de la carte (y compris déplacement), pensé pour une future détection de conflit en contexte multi-utilisateur — non exploité activement en v1 (pas de logique de conflit implémentée maintenant).

**API — contrat**
- `GET /cards` : liste toutes les cartes (tous champs, y compris description).
- `POST /cards` : crée une carte. Seul `title` est requis dans le corps de la requête ; les autres champs sont optionnels. La carte créée est positionnée en `column="En exploration"`, avec un `position` calculé en fin de colonne.
- `PATCH /cards/{id}` : mise à jour partielle d'une carte — accepte n'importe quel sous-ensemble de `title`, `assignee_name`, `due_date`, `description`, `column`, `position`. C'est ce même endpoint qui est utilisé aussi bien pour l'édition depuis la modale que pour un déplacement par glisser-déposer (changement de `column` et/ou `position`). `created_at` n'est jamais accepté en entrée ; `updated_at` est recalculé serveur à chaque appel.
- `DELETE /cards/{id}` : supprime définitivement une carte. Retourne 404 si l'identifiant n'existe pas.
- Toute tentative de sauvegarde avec un `title` vide ou absent est rejetée par l'API avec une erreur de validation (422), en cohérence avec la contrainte "titre requis" imposée aussi côté front.

**Front — modules**
- `Board` : composant racine, charge les cartes via l'API au montage, calcule le regroupement par colonne et les compteurs d'en-tête.
- `Column` : affiche l'en-tête (nom + compteur) et la liste ordonnée (par `position`) des cartes de la colonne ; zone de drop pour le drag & drop.
- `Card` (vue tableau) : affiche titre, nom, échéance ; applique le style "en retard" si `due_date` dépassée et `column !== "Terminé"` ; expose l'icône crayon (édition inline du titre) et gère le double-clic (ouverture de la modale complète).
- `CardModal` : formulaire complet (titre, nom, échéance, description, date de création en lecture seule), boutons Sauvegarder / Annuler / Supprimer, désactivation de Sauvegarder tant que le titre est vide.
- Drag & drop implémenté avec une librairie React dédiée (ex. dnd-kit) gérant à la fois le déplacement inter-colonnes et le réordonnancement intra-colonne ; chaque drop déclenche un `PATCH /cards/{id}` avec la nouvelle `column`/`position`.

**Thème visuel**
- MUI avec un thème personnalisé (`ThemeProvider` + `createTheme`) définissant une palette chaude et rassurante (tons terracotta/crème/ocre) pour le fond, les colonnes, les cartes et l'état "en retard".

## Testing Decisions

- **Principe** : les tests portent sur le comportement observable de l'API HTTP (requêtes → réponses / état persisté), pas sur les détails d'implémentation internes (pas de test unitaire isolé sur des fonctions privées, pas de mock de la couche SQLite).
- **Seam de test** : `TestClient` de FastAPI, frappant une vraie base SQLite de test (fichier temporaire ou base en mémoire dédiée aux tests, réinitialisée entre les tests) — c'est le seam le plus haut disponible puisqu'il n'existe aucune couche de test préexistante dans ce repo greenfield.
- **Périmètre** : uniquement le back (endpoints CRUD des cartes). Pas de tests automatisés front en v1.
- **Cas à couvrir** :
  - création d'une carte avec seulement un titre : valeurs par défaut correctes (`column="En exploration"`, `id` généré, `created_at` renseigné) ;
  - création rejetée si `title` vide ou absent (422) ;
  - liste des cartes reflète les cartes créées ;
  - mise à jour partielle (`PATCH`) modifie bien les champs fournis, laisse les autres inchangés, et met à jour `updated_at` ;
  - déplacement d'une carte (changement de `column`/`position` via `PATCH`) est bien persisté ;
  - suppression retire la carte de la liste ;
  - opérations sur un `id` inexistant retournent 404.
- **Prior art** : aucun test n'existe encore dans ce repo (projet greenfield) ; cette suite établit le premier pattern de test du projet, à réutiliser pour toute évolution future de l'API.

## Out of Scope

- Authentification / gestion des utilisateurs / permissions.
- Synchronisation temps réel multi-utilisateurs (WebSocket, résolution de conflits) — seul le champ `updated_at` est posé en prévision.
- Gestion/à-la-carte des swimlanes (création, nommage, réordonnancement) — le champ `lane` existe dans le modèle mais reste figé sur une valeur unique.
- Colonnes configurables par l'utilisateur (ajout/suppression/renommage de colonnes) — la liste des 7 colonnes est fixe et codée en dur pour cette v1.
- Recherche, filtres, tri configurable des cartes.
- Notifications ou rappels liés aux échéances (au-delà de l'indicateur visuel de retard).
- Pièces jointes, commentaires ou historique d'activité sur une carte.
- Archivage des cartes (seule la suppression définitive existe).
- Limites de travail en cours (WIP limits) par colonne.
- Internationalisation — l'interface est en français uniquement.
- Tests automatisés front, packaging Docker, pipeline CI/CD, déploiement en production.
- Toute intégration ou structuration OpenSpec de ce projet lui-même (spécifications, `openspec/`, changes trackées) — volontairement hors périmètre, réservée à un exercice ultérieur distinct.

## Further Notes

- Ce prototype est explicitement construit **sans** OpenSpec. L'objectif final du repo est d'apprendre OpenSpec via un scénario "brownfield" : introduire OpenSpec sur une base de code déjà existante et non conçue avec cette méthode. Ce PRD et son implémentation ne doivent donc pas anticiper de structure OpenSpec — cela viendra dans une étape ultérieure, séparée.
- Le champ `lane` et le champ `updated_at` sont des décisions volontairement anticipées dans le modèle de données pour éviter une migration de schéma lourde plus tard (vraies swimlanes, détection de conflits), sans pour autant implémenter la logique correspondante maintenant.
- Le choix de la librairie de drag & drop côté front (ex. dnd-kit) et le détail exact du thème MUI (valeurs de couleurs) sont laissés à l'appréciation de l'agent d'implémentation, dans le respect des contraintes énoncées ci-dessus (glisser-déposer inter/intra-colonne, palette chaude et rassurante).
