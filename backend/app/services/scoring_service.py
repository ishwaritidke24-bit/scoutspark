from typing import Dict, Any, List, Tuple
import re


def calculate_icp_score(
    company_data: Dict[str, Any],
    icp: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Deterministic, transparent scoring service for ScoutSpark.
    
    Evaluates prospect fit against the saved Ideal Customer Profile (ICP).
    Scores are strictly bounded between 0 and 100.
    
    Separates two distinct concepts:
    1. Firmographic and commercial fit of the company (industry, size, signals, geography).
    2. Identification of a specific, relevant decision-maker (sales leader or founder).
       - Promising companies are NOT rejected simply because a buyer's name is unknown.
       - Full buyer points are ONLY awarded when a genuinely relevant decision-maker is identified.
       - Non-sales roles (e.g., engineering blog authors, medical officers) receive 0 buyer points.
    
    Missing data fields are explicitly penalized and listed in missing_information.
    Exclusions apply deterministic deductions.
    An ICP fit score is not a prediction that the company will buy.
    """
    score = 0
    fit_reasons: List[str] = []
    missing_info: List[str] = []
    breakdown: Dict[str, int] = {}

    target_industries = [i.lower().strip() for i in icp.get("target_industries", []) if i.strip()]
    target_roles = [r.lower().strip() for r in icp.get("target_roles", []) if r.strip()]
    target_geos = [g.lower().strip() for g in icp.get("target_geographies", []) if g.strip()]
    exclusions = [e.lower().strip() for e in icp.get("exclusions", []) if e.strip()]

    # -------------------------------------------------------------------------
    # 1. Industry & Software Model Fit (Weight: 30)
    # -------------------------------------------------------------------------
    industry = (company_data.get("industry") or "").strip().lower()
    sub_industry = (company_data.get("sub_industry") or "").strip().lower()
    summary = (company_data.get("summary") or "").strip().lower()
    
    if not industry and not sub_industry:
        missing_info.append("Company industry & sub-vertical not specified")
        breakdown["industry"] = 0
    else:
        matched_ind = False
        for ti in target_industries:
            keywords = [k for k in re.split(r"[\s,&/]+", ti) if len(k) > 2]
            if ti in industry or ti in sub_industry or any(k in industry or k in sub_industry for k in keywords):
                matched_ind = True
                break
        
        if matched_ind:
            breakdown["industry"] = 30
            score += 30
            fit_reasons.append(f"Industry matches target ICP: {company_data.get('industry')}")
        else:
            # Check if broad B2B SaaS or technology software
            broad_software = any(sw in f"{industry} {sub_industry} {summary}" for sw in ["software", "saas", "b2b", "cloud", "developer", "api", "platform", "infrastructure"])
            if broad_software:
                breakdown["industry"] = 15
                score += 15
                fit_reasons.append(f"Adjacent software industry: {company_data.get('industry')}")
            else:
                breakdown["industry"] = 0
                fit_reasons.append(f"Industry outside target ICP: {company_data.get('industry')}")

    # -------------------------------------------------------------------------
    # 2. Company Size & Preferred Scale Alignment (Weight: 20)
    # Target: Prefer companies with ~10–200 employees. Never assume size is known.
    # -------------------------------------------------------------------------
    employee_count_raw = (company_data.get("employee_count") or "").strip()
    employee_count_str = employee_count_raw.lower()
    
    is_unknown_size = (
        not employee_count_str 
        or "unknown" in employee_count_str 
        or "unverified" in employee_count_str 
        or "n/a" in employee_count_str
    )

    if is_unknown_size:
        missing_info.append("Company headcount is unverified / unknown; public verification needed")
        breakdown["company_size"] = 0
        fit_reasons.append("Headcount is unknown; needs verification against public registries")
    else:
        clean_count_str = employee_count_str.replace(",", "")
        numbers = [int(n) for n in re.findall(r"\d+", clean_count_str)]
        avg_headcount = sum(numbers) / len(numbers) if numbers else 0
        
        # Target sweet spot: 10 - 200 employees
        if 10 <= avg_headcount <= 200:
            breakdown["company_size"] = 20
            score += 20
            fit_reasons.append(f"Headcount ({employee_count_raw}) is in preferred 10–200 employee sweet spot")
        elif 5 <= avg_headcount < 10 or 201 <= avg_headcount <= 500:
            breakdown["company_size"] = 10
            score += 10
            fit_reasons.append(f"Headcount ({employee_count_raw}) is acceptable but outside preferred 10–200 range")
        else:
            # Extremely large enterprise (>500) or under 5
            breakdown["company_size"] = 0
            fit_reasons.append(f"Headcount ({employee_count_raw}) outside primary early-stage target size")

    # -------------------------------------------------------------------------
    # 3. Evidence Quality & Commercial Growth Signals (Weight: 20)
    # Checks for public signals: sales hiring, product launches, market expansion.
    # -------------------------------------------------------------------------
    observed_facts = company_data.get("observed_facts") or []
    if not observed_facts:
        missing_info.append("No public evidence citations verified yet")
        breakdown["evidence"] = 0
    else:
        verified_facts = [f for f in observed_facts if f.get("verified", True)]
        all_text = " ".join([f.get("fact", "") for f in verified_facts] + [summary] + (company_data.get("tags") or [])).lower()
        
        # Look for commercial and sales growth signals
        growth_keywords = [
            "hiring sales", "account executive", "bdr", "sdr", "sales team", "sales development",
            "gtm", "go-to-market", "expanding sales", "commercial expansion", "new market",
            "series a", "series b", "seed funding", "product launch", "general availability",
            "enterprise tier", "customer expansion", "scaling"
        ]
        has_commercial_signal = any(gw in all_text for gw in growth_keywords)

        if len(verified_facts) >= 2 and has_commercial_signal:
            breakdown["evidence"] = 20
            score += 20
            fit_reasons.append(f"Strong grounding: {len(verified_facts)} verified signals including commercial growth indicators")
        elif len(verified_facts) >= 1:
            breakdown["evidence"] = 12
            score += 12
            fit_reasons.append(f"Moderate grounding: {len(verified_facts)} verified public evidence signals")
        else:
            breakdown["evidence"] = 4
            score += 4
            missing_info.append("Available evidence is weakly grounded or unconfirmed")

    # -------------------------------------------------------------------------
    # 4. Decision-Maker / Buyer Persona Fit (Weight: 15)
    # Relevant buyers for sales outreach: Founder/CEO, Head/VP Sales, BDR Mgr, Head of Growth, RevOps.
    # Engineering blog authors or medical officers receive 0 buyer points.
    # Unknown buyer = 0 points, but does NOT prevent company from qualifying.
    # -------------------------------------------------------------------------
    buyer = company_data.get("target_buyer") or {}
    buyer_title = (buyer.get("title") or "").strip().lower()
    buyer_name = (buyer.get("name") or "").strip().lower()

    is_unassigned_buyer = (
        not buyer_title 
        or "unknown" in buyer_title 
        or "unassigned" in buyer_title 
        or "leadership lead" in buyer_title 
        or "vp / director" in buyer_title 
        or "unverified" in buyer_title
    )

    if is_unassigned_buyer:
        missing_info.append("Specific decision-maker (sales leader or founder) not yet identified")
        breakdown["buyer_role"] = 0
        fit_reasons.append("Specific decision-maker unknown; qualified on company fit alone")
    else:
        # Check against target roles
        matched_target_role = False
        for tr in target_roles:
            role_keywords = [k for k in re.split(r"[\s,/]+", tr) if len(k) > 2]
            if tr in buyer_title or any(k in buyer_title for k in role_keywords):
                matched_target_role = True
                break
        
        # Check if the title is explicitly non-commercial (author of engineering postmortem, doctor, nurse, etc.)
        unrelated_titles = [
            "engineer", "engineering", "sre", "developer", "architect", "designer",
            "medical", "clinical", "physician", "doctor", "cmo", "nurse",
            "legal", "counsel", "compliance officer", "accountant", "editor", "author"
        ]
        # Only treat as unrelated if it did NOT match an explicit target role
        is_explicitly_unrelated = not matched_target_role and any(ut in buyer_title for ut in unrelated_titles)

        if matched_target_role:
            breakdown["buyer_role"] = 15
            score += 15
            fit_reasons.append(f"Identified relevant sales/growth decision-maker: {buyer.get('title')}")
        elif is_explicitly_unrelated:
            breakdown["buyer_role"] = 0
            missing_info.append(f"Observed person ({buyer.get('title')}) is not a sales or growth buyer; sales decision-maker unverified")
            fit_reasons.append(f"Person mentioned ({buyer.get('title')}) is outside target sales buyer personas")
        else:
            # Adjacent business leadership role (e.g. VP Marketing, Head of Product, COO)
            breakdown["buyer_role"] = 6
            score += 6
            fit_reasons.append(f"Adjacent commercial leadership role: {buyer.get('title')}")

    # -------------------------------------------------------------------------
    # 5. Geography Alignment (Weight: 15)
    # Target: India, United States, United Kingdom (and remote operating in these regions).
    # -------------------------------------------------------------------------
    hq = (company_data.get("headquarters") or "").strip().lower()
    if not hq:
        missing_info.append("Headquarters location missing")
        breakdown["geography"] = 0
    else:
        geo_keywords = ["india", "bangalore", "bengaluru", "mumbai", "delhi", "hyderabad", "pune",
                        "us", "usa", "united states", "san francisco", "new york", "austin", "seattle", "boston", "chicago", "california",
                        "uk", "united kingdom", "london", "england", "remote", "north america"]
        # Check against passed target_geographies if provided
        for tg in target_geos:
            for kw in re.split(r"[\s,/]+", tg):
                if len(kw) > 2:
                    geo_keywords.append(kw)
        
        matched_geo = any(gk in hq for gk in set(geo_keywords))
        if matched_geo:
            breakdown["geography"] = 15
            score += 15
            fit_reasons.append("Location matches target operating geography (India, US, UK, or Remote)")
        else:
            breakdown["geography"] = 5
            score += 5
            fit_reasons.append("Location is outside primary target regions")

    # -------------------------------------------------------------------------
    # 6. Negative Exclusions Check (Deduction: -45)
    # Excludes: consumer-only, agencies, consultancies, staffing/recruitment, giant enterprises.
    # -------------------------------------------------------------------------
    text_to_check = f"{company_data.get('company_name', '')} {summary} {industry} {sub_industry}".lower()
    exclusion_triggered = None

    for exc in exclusions:
        if not exc:
            continue
        if exc in text_to_check:
            exclusion_triggered = exc
            break
        # Match core exclusion tokens (e.g. "agencies", "consultancies", "staffing", "recruitment", "consumer-only")
        keywords = [k for k in re.split(r"[\s,/&]+", exc) if len(k) > 3 and k not in ["and", "with", "from", "very", "outside", "preferred", "businesses", "software"]]
        for kw in keywords:
            root = kw.rstrip("ies").rstrip("s")
            if len(root) >= 4 and root in text_to_check:
                exclusion_triggered = exc
                break
        if exclusion_triggered:
            break

    # Also check if headcount indicates a giant enterprise (>1000) and enterprise exclusion is set
    if not is_unknown_size:
        clean_count_str = employee_count_str.replace(",", "")
        numbers = [int(n) for n in re.findall(r"\d+", clean_count_str)]
        avg_headcount = sum(numbers) / len(numbers) if numbers else 0
        if avg_headcount >= 1000:
            for exc in exclusions:
                if "large enterprise" in exc or "enterprise" in exc:
                    exclusion_triggered = "Very large enterprise (>1,000 employees)"
                    break

    if exclusion_triggered:
        score = max(0, score - 45)
        breakdown["exclusion_penalty"] = -45
        fit_reasons.append(f"Triggered negative exclusion match: '{exclusion_triggered}'")

    # Strictly clamp between 0 and 100
    final_score = max(0, min(100, score))

    # Derive qualitative fit level
    if final_score >= 85:
        fit_level = "exceptional"
    elif final_score >= 70:
        fit_level = "strong"
    elif final_score >= 50:
        fit_level = "moderate"
    else:
        fit_level = "unlikely"

    return {
        "fit_score": final_score,
        "fit_level": fit_level,
        "fit_reasons": fit_reasons,
        "missing_information": missing_info,
        "scoring_breakdown": breakdown,
        "scoring_method": "deterministic_baseline_rules_v2",
    }
