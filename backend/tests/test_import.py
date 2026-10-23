import io


def test_import_non_csv_rejected(client):
    file_content = b"print('malicious')"
    response = client.post(
        "/api/v1/prospects/import",
        files={"file": ("script.py", file_content, "application/x-python")}
    )
    assert response.status_code == 400
    assert "only csv files" in response.json()["detail"].lower()


def test_import_empty_csv_rejected(client):
    response = client.post(
        "/api/v1/prospects/import",
        files={"file": ("empty.csv", b"", "text/csv")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_import_missing_required_headers(client):
    csv_data = "name,location\nAcme Corp,San Francisco\n"
    response = client.post(
        "/api/v1/prospects/import",
        files={"file": ("test.csv", csv_data.encode("utf-8"), "text/csv")}
    )
    assert response.status_code == 400
    assert "missing required csv column" in response.json()["detail"].lower()


def test_import_valid_csv_with_row_errors(client):
    csv_content = """company_name,domain,industry,employee_count,headquarters,buyer_name,buyer_title
CloudFlux,cloudflux.internal,Developer Tools & Infrastructure,45 employees,Seattle WA,Alex Chen,VP Engineering
,broken.internal,Fintech,30 employees,New York NY,Jane Doe,CFO
FinSecure,finsecure.internal,Fintech & Payments Infrastructure,60 employees,Chicago IL,David Ross,Head of Risk
"""
    response = client.post(
        "/api/v1/prospects/import",
        files={"file": ("prospects.csv", csv_content.encode("utf-8"), "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["importedCount"] == 2
    assert data["errorCount"] == 1
    # Check row error detail
    assert data["errors"][0]["row"] == 3
    assert "empty" in data["errors"][0]["error"].lower()

    # Verify CloudFlux and FinSecure were imported into DB
    p_res = client.get("/api/v1/prospects?query=CloudFlux")
    assert p_res.status_code == 200
    assert len(p_res.json()) == 1
    assert p_res.json()[0]["companyName"] == "CloudFlux"
    assert p_res.json()[0]["provenance"] == "imported"
