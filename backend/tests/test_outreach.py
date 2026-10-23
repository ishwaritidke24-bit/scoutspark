def test_list_outreach_drafts(client):
    response = client.get("/api/v1/outreach-drafts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8


def test_list_drafts_by_prospect_id(client):
    response = client.get("/api/v1/outreach-drafts?prospect_id=prospect-01")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["prospectId"] == "prospect-01"


def test_create_and_approve_draft(client):
    create_res = client.post(
        "/api/v1/outreach-drafts",
        json={
            "prospectId": "prospect-02",
            "subject": "AuraPulse's clinical intake workflow",
            "body": "Hi Dr. Vance,\n\nFollowing up on our discussion.",
            "notes": "Second follow-up draft"
        }
    )
    assert create_res.status_code == 201
    draft_data = create_res.json()
    draft_id = draft_data["id"]
    assert draft_data["isApproved"] is False

    # Human approval update
    patch_res = client.patch(
        f"/api/v1/outreach-drafts/{draft_id}",
        json={
            "isApproved": True,
            "approvedBy": "Alex Rivera (Founder Approved)"
        }
    )
    assert patch_res.status_code == 200
    approved_data = patch_res.json()
    assert approved_data["isApproved"] is True
    assert approved_data["approvedAt"] is not None

    # Check prospect status advanced to approved
    p_res = client.get("/api/v1/prospects/prospect-02")
    assert p_res.json()["pipelineStage"] == "approved"
    assert p_res.json()["emailDraft"]["isApproved"] is True
