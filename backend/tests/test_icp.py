def test_get_icp(client):
    response = client.get("/api/v1/icp")
    assert response.status_code == 200
    data = response.json()
    assert data["companyName"] == "ScoutSpark AI"
    assert data["productName"] == "ScoutSpark"
    assert "B2B SaaS" in data["targetIndustries"]
    assert "Founder or CEO" in data["targetRoles"]
    assert "Head or VP of Sales" in data["targetRoles"]


def test_update_icp(client):
    payload = {
        "companyName": "ScoutSpark Enterprise",
        "valueProposition": "Automated B2B account intelligence.",
        "targetIndustries": ["Developer Tools", "Cybersecurity", "Fintech"],
        "targetRoles": ["VP Engineering", "CISO", "Head of Finance"]
    }
    response = client.put("/api/v1/icp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["companyName"] == "ScoutSpark Enterprise"
    assert len(data["targetIndustries"]) == 3
    assert "Cybersecurity" in data["targetIndustries"]

    # Verify persistence
    get_res = client.get("/api/v1/icp")
    assert get_res.json()["companyName"] == "ScoutSpark Enterprise"
