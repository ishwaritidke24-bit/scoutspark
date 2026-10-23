from typing import Dict, Any, List, Tuple
import re


def calculate_icp_score(
    company_data: Dict[str, Any],
    icp: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Deterministic, transparent baseline scoring service.
    
    Evaluates prospect fit against the saved Ideal Customer Profile (ICP).
    Scores are strictly bounded between 0 and 100.
    Missing data fields are explicitly penalized and listed in missing_information.
    Exclusions apply deterministic deductions.
    """
    score = 0
    max_score = 100
    fit_reasons: List[str] = []
    missing_info: List[str] = []
    breakdown: Dict[str, int] = {}

    target_industries = [i.lower() for i in icp.get("target_industries", [])]
    target_roles = [r.lower() for r in icp.get("target_roles", [])]
    target_geos = [g.lower() for g in icp.get("target_geographies", [])]
    exclusions = [e.lower() for e in icp.get("exclusions", [])]

    # 1. Industry Alignment (Weight: 30)
    industry = (company_data.get("industry") or "").lower()
    sub_industry = (company_data.get("sub_industry") or "").lower()
    
    if not industry and not sub_industry:
        missing_info.append("Company industry & sub-vertical not specified")
        breakdown["industry"] = 0
    else:
        matched_ind = False
        for ti in target_industries:
            # Check for direct or keyword match
            keywords = [k for k in re.split(r"[\s,&/]+", ti) if len(k) > 2]
            if ti in industry or ti in sub_industry or any(k in industry or k in sub_industry for k in keywords):
                matched_ind = True
                break
        
        if matched_ind:
            breakdown["industry"] = 30
            score += 30
            fit_reasons.append(f"Industry matches target ICP: {company_data.get('industry')}")
        else:
            breakdown["industry"] = 10
            score += 10
            fit_reasons.append(f"Adjacent industry: {company_data.get('industry')}")

    # 2. Company Size / Headcount Alignment (Weight: 25)
    employee_count_str = (company_data.get("employee_count") or "").lower()
    if not employee_count_str:
        missing_info.append("Verified employee headcount data absent")
        breakdown["company_size"] = 0
    else:
        # Extract digits
        numbers = [int(n) for n in re.findall(r"\d+", employee_count_str)]
        avg_headcount = sum(numbers) / len(numbers) if numbers else 0
        
        # Check against typical early-stage ranges (20-150 sweet spot)
        if 20 <= avg_headcount <= 100:
            breakdown["company_size"] = 25
            score += 25
            fit_reasons.append(f"Headcount ({employee_count_str}) is in the ideal 20-100 employee sweet spot")
        elif 10 <= avg_headcount <= 250:
            breakdown["company_size"] = 15
            score += 15
            fit_reasons.append(f"Headcount ({employee_count_str}) is within acceptable range")
        else:
            breakdown["company_size"] = 5
            score += 5
            fit_reasons.append(f"Headcount ({employee_count_str}) is outside primary target sweet spot")

    # 3. Buyer Role Match (Weight: 20)
    buyer = company_data.get("target_buyer") or {}
    buyer_title = (buyer.get("title") or "").lower()
    if not buyer_title:
        missing_info.append("Target buyer title / persona unverified")
        breakdown["buyer_role"] = 0
    else:
        matched_role = False
        for tr in target_roles:
            role_keywords = [k for k in re.split(r"[\s,/]+", tr) if len(k) > 2]
            if tr in buyer_title or any(k in buyer_title for k in role_keywords):
                matched_role = True
                break
        
        if matched_role:
            breakdown["buyer_role"] = 20
            score += 20
            fit_reasons.append(f"Target buyer role matches ICP: {buyer.get('title')}")
        else:
            breakdown["buyer_role"] = 8
            score += 8
            fit_reasons.append(f"Adjacent buyer role: {buyer.get('title')}")

    # 4. Verified Evidence Grounding (Weight: 15)
    observed_facts = company_data.get("observed_facts") or []
    if not observed_facts:
        missing_info.append("No public evidence citations verified yet")
        breakdown["evidence"] = 0
    else:
        verified_count = sum(1 for f in observed_facts if f.get("verified", True))
        if verified_count >= 3:
            breakdown["evidence"] = 15
            score += 15
            fit_reasons.append(f"Strong grounding: {verified_count} verified public evidence signals")
        elif verified_count >= 1:
            breakdown["evidence"] = 10
            score += 10
            fit_reasons.append(f"Moderate grounding: {verified_count} verified evidence signals")
        else:
            breakdown["evidence"] = 3
            score += 3

    # 5. Geography Presence (Weight: 10)
    hq = (company_data.get("headquarters") or "").lower()
    if not hq:
        missing_info.append("Headquarters location missing")
        breakdown["geography"] = 0
    else:
        matched_geo = any(g in hq for g in ["us", "usa", "san francisco", "new york", "austin", "seattle", "chicago", "uk", "london", "europe", "germany", "berlin", "canada", "remote", "north america"])
        if matched_geo:
            breakdown["geography"] = 10
            score += 10
            fit_reasons.append("Location matches target operating geography")
        else:
            breakdown["geography"] = 4
            score += 4

    # 6. Negative Exclusions Check (Deduction: up to -50)
    text_to_check = f"{company_data.get('company_name', '')} {company_data.get('summary', '')} {industry} {sub_industry}".lower()
    exclusion_triggered = False
    for exc in exclusions:
        if exc and exc in text_to_check:
            exclusion_triggered = True
            fit_reasons.append(f"Triggered negative exclusion match: '{exc}'")
            break

    if exclusion_triggered:
        score = max(0, score - 45)
        breakdown["exclusion_penalty"] = -45

    # Clamp score strictly between 0 and 100
    final_score = max(0, min(100, score))

    # Derive qualitative fit level
    if final_score >= 90:
        fit_level = "exceptional"
    elif final_score >= 75:
        fit_level = "strong"
    elif final_score >= 60:
        fit_level = "moderate"
    else:
        fit_level = "unlikely"

    return {
        "fit_score": final_score,
        "fit_level": fit_level,
        "fit_reasons": fit_reasons,
        "missing_information": missing_info,
        "scoring_breakdown": breakdown,
        "scoring_method": "deterministic_baseline_rules_v1",
    }
