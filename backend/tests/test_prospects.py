def test_list_prospects_unfiltered(client):
    response = client.get("/api/v1/prospects")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 8
    # Default sort is fit_score desc
    assert data[0]["fitScore"] >= data[1]["fitScore"]


def test_list_prospects_search_query(client):
    response = client.get("/api/v1/prospects?query=KiteMetrics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["companyName"] == "KiteMetrics"


def test_list_prospects_industry_filter(client):
    response = client.get("/api/v1/prospects?industry=HealthTech%20%26%20Digital%20Health")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["companyName"] == "AuraPulse Health"


def test_list_prospects_min_fit_score(client):
    response = client.get("/api/v1/prospects?min_fit_score=90")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    for p in data:
        assert p["fitScore"] >= 90


def test_list_prospects_stage_filter(client):
    response = client.get("/api/v1/prospects?pipeline_stage=approved")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["companyName"] == "VeritasFlow"


def test_list_prospects_sorting(client):
    # Ascending sort
    response = client.get("/api/v1/prospects?sort_by=fit_score&sort_direction=asc")
    assert response.status_code == 200
    data = response.json()
    assert data[0]["fitScore"] <= data[-1]["fitScore"]
    assert data[0]["companyName"] == "OrbitCraft Dev"  # 42%


def test_get_prospect_by_id_success(client):
    response = client.get("/api/v1/prospects/prospect-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "prospect-01"
    assert data["companyName"] == "KiteMetrics"
    assert len(data["observedFacts"]) >= 3
    assert len(data["hypotheses"]) >= 2
    assert "emailDraft" in data
    assert "targetBuyer" in data


def test_get_prospect_by_id_not_found(client):
    response = client.get("/api/v1/prospects/non-existent-999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_create_prospect(client):
    payload = {
        "companyName": "NovaSync Tech",
        "domain": "novasync.internal",
        "industry": "Developer Tools & Infrastructure",
        "subIndustry": "Database CDC",
        "headquarters": "San Francisco, CA",
        "employeeCount": "40 employees",
        "summary": "Real-time CDC connector for PostgreSQL and Kafka.",
        "targetBuyer": {
            "name": "Sarah Connor",
            "title": "VP of Engineering",
            "emailPlaceholder": "sarah@novasync.internal",
            "roleType": "Engineering Leader"
        }
    }
    response = client.post("/api/v1/prospects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["companyName"] == "NovaSync Tech"
    assert data["pipelineStage"] == "to_research"
    # Deterministic baseline scoring computed score
    assert data["fitScore"] > 0
    assert len(data["fitReasons"]) > 0


def test_update_prospect(client):
    response = client.patch(
        "/api/v1/prospects/prospect-01",
        json={"summary": "Updated executive summary for testing."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"] == "Updated executive summary for testing."


def test_update_stage(client):
    response = client.patch(
        "/api/v1/prospects/prospect-01/stage",
        json={"pipelineStage": "contacted", "outcomeNotes": "Manual email sent on Oct 23"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["pipelineStage"] == "contacted"
    assert data["outcomeNotes"] == "Manual email sent on Oct 23"


def test_update_outcome(client):
    response = client.patch(
        "/api/v1/prospects/prospect-02/outcome",
        json={"outcomeNotes": "Spoke to VP Clinic Ops; requesting pilot pricing"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["outcomeNotes"] == "Spoke to VP Clinic Ops; requesting pilot pricing"


def test_delete_prospect(client):
    del_res = client.delete("/api/v1/prospects/prospect-08")
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get("/api/v1/prospects/prospect-08")
    assert get_res.status_code == 404
