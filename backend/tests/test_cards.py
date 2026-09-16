"""Tests HTTP (TestClient) des endpoints CRUD `/cards`.

Portent sur le comportement observable de l'API (requêtes -> réponses /
état persisté), conformément aux décisions de test du PRD
(docs/prd-kanban-v1.md, section "Testing Decisions").
"""

import time


def test_create_card_with_only_title_has_correct_defaults(client):
    response = client.post("/cards", json={"title": "Nouveau sujet"})

    assert response.status_code == 201
    body = response.json()

    assert body["title"] == "Nouveau sujet"
    assert body["column"] == "En exploration"
    assert body["lane"] == "default"
    assert isinstance(body["id"], str) and body["id"]
    assert body["created_at"]
    assert body["updated_at"]
    assert body["assignee_name"] is None
    assert body["due_date"] is None
    assert body["description"] is None
    assert isinstance(body["position"], (int, float))


def test_create_card_rejected_when_title_missing(client):
    response = client.post("/cards", json={"assignee_name": "Alice"})
    assert response.status_code == 422


def test_create_card_rejected_when_title_blank(client):
    response = client.post("/cards", json={"title": "   "})
    assert response.status_code == 422


def test_list_cards_reflects_created_cards(client):
    client.post("/cards", json={"title": "Carte A"})
    client.post("/cards", json={"title": "Carte B"})

    response = client.get("/cards")
    assert response.status_code == 200
    titles = {card["title"] for card in response.json()}
    assert titles == {"Carte A", "Carte B"}


def test_patch_partial_update_changes_only_given_fields_and_bumps_updated_at(client):
    created = client.post("/cards", json={"title": "Titre initial"}).json()

    time.sleep(0.01)

    response = client.patch(
        f"/cards/{created['id']}",
        json={"assignee_name": "Bob"},
    )
    assert response.status_code == 200
    updated = response.json()

    assert updated["title"] == "Titre initial"  # inchangé
    assert updated["assignee_name"] == "Bob"  # modifié
    assert updated["column"] == created["column"]  # inchangé
    assert updated["created_at"] == created["created_at"]  # jamais modifiable
    assert updated["updated_at"] != created["updated_at"]  # recalculé serveur


def test_patch_rejects_blank_title(client):
    created = client.post("/cards", json={"title": "Titre initial"}).json()

    response = client.patch(f"/cards/{created['id']}", json={"title": ""})
    assert response.status_code == 422

    response = client.patch(f"/cards/{created['id']}", json={"title": None})
    assert response.status_code == 422


def test_patch_rejects_invalid_column(client):
    created = client.post("/cards", json={"title": "Titre"}).json()

    response = client.patch(f"/cards/{created['id']}", json={"column": "Colonne inexistante"})
    assert response.status_code == 422


def test_move_card_column_and_position_is_persisted(client):
    created = client.post("/cards", json={"title": "À déplacer"}).json()

    response = client.patch(
        f"/cards/{created['id']}",
        json={"column": "À développer", "position": 2.5},
    )
    assert response.status_code == 200
    moved = response.json()
    assert moved["column"] == "À développer"
    assert moved["position"] == 2.5

    # La persistance doit survivre à une relecture indépendante.
    listed = client.get("/cards").json()
    persisted = next(card for card in listed if card["id"] == created["id"])
    assert persisted["column"] == "À développer"
    assert persisted["position"] == 2.5


def test_delete_removes_card_from_list(client):
    created = client.post("/cards", json={"title": "À supprimer"}).json()

    response = client.delete(f"/cards/{created['id']}")
    assert response.status_code == 204

    listed = client.get("/cards").json()
    assert all(card["id"] != created["id"] for card in listed)


def test_patch_on_unknown_id_returns_404(client):
    response = client.patch("/cards/unknown-id", json={"title": "x"})
    assert response.status_code == 404


def test_delete_on_unknown_id_returns_404(client):
    response = client.delete("/cards/unknown-id")
    assert response.status_code == 404


def test_new_card_position_is_appended_after_existing_cards_in_column(client):
    first = client.post("/cards", json={"title": "Premier"}).json()
    second = client.post("/cards", json={"title": "Second"}).json()

    assert second["position"] > first["position"]
