from backend.app.services.scoring_service import calculate_icp_score


def test_scoring_bounds_and_factors():
    icp = {
        "target_industries": ["Developer Tools & Infrastructure", "Fintech"],
        "target_roles": ["VP of Engineering", "Chief Technology Officer"],
        "target_geographies": ["North America", "San Francisco"],
        "exclusions": ["agency", "consulting", "b2c"],
    }

    # Perfect match
    company_good = {
        "company_name": "TraceOps",
        "industry": "Developer Tools & Infrastructure",
        "sub_industry": "Observability",
        "employee_count": "45 employees",
        "headquarters": "San Francisco, CA",
        "target_buyer": {"title": "VP of Engineering"},
        "observed_facts": [
            {"verified": True},
            {"verified": True},
            {"verified": True},
        ],
    }

    res_good = calculate_icp_score(company_good, icp)
    assert 0 <= res_good["fit_score"] <= 100
    assert res_good["fit_score"] >= 90
    assert res_good["fit_level"] == "exceptional"
    assert len(res_good["fit_reasons"]) >= 4
    assert len(res_good["missing_information"]) == 0


def test_scoring_missing_fields_penalties():
    icp = {
        "target_industries": ["Developer Tools"],
        "target_roles": ["VP of Engineering"],
        "target_geographies": ["San Francisco"],
        "exclusions": ["agency"],
    }

    # Completely blank company
    company_empty = {}
    res_empty = calculate_icp_score(company_empty, icp)
    assert 0 <= res_empty["fit_score"] <= 100
    assert res_empty["fit_score"] < 40
    # Must flag missing information explicitly
    assert len(res_empty["missing_information"]) >= 4
    assert any("industry" in m.lower() for m in res_empty["missing_information"])
    assert any("headcount" in m.lower() for m in res_empty["missing_information"])


def test_scoring_exclusions_docking():
    icp = {
        "target_industries": ["Developer Tools"],
        "target_roles": ["VP of Engineering"],
        "target_geographies": ["San Francisco"],
        "exclusions": ["consulting agency", "outsourcing"],
    }

    company_agency = {
        "company_name": "Dev Consulting Agency",
        "industry": "Developer Tools",
        "summary": "We are a boutique software outsourcing firm.",
        "employee_count": "50 employees",
        "headquarters": "San Francisco, CA",
        "target_buyer": {"title": "VP of Engineering"},
    }

    res = calculate_icp_score(company_agency, icp)
    assert 0 <= res["fit_score"] <= 100
    assert any("exclusion" in r.lower() for r in res["fit_reasons"])
    assert res["scoring_breakdown"].get("exclusion_penalty") == -45
