from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io

from ..database import get_db
from ..schemas import (
    ProspectOut,
    ProspectCreate,
    ProspectUpdate,
    ProspectStageUpdate,
    ProspectOutcomeUpdate,
    ImportResponse,
    ImportErrorDetail,
)
from ..services.prospect_service import ProspectService

router = APIRouter(prefix="/api/v1/prospects", tags=["Prospects"])


@router.get("", response_model=List[ProspectOut])
def list_prospects(
    query: Optional[str] = Query(None, description="Search term across name, domain, industry, summary"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    min_fit_score: Optional[int] = Query(None, ge=0, le=100, description="Minimum fit score (0-100)"),
    pipeline_stage: Optional[str] = Query(None, description="Filter by pipeline stage"),
    sort_by: Optional[str] = Query("fit_score", description="Sort field"),
    sort_direction: Optional[str] = Query("desc", pattern="^(asc|desc)$", description="Sort direction"),
    db: Session = Depends(get_db),
):
    """List prospects with multi-criteria filtering, search, and sorting."""
    prospects = ProspectService.get_prospects(
        db=db,
        query=query,
        industry=industry,
        min_fit_score=min_fit_score,
        pipeline_stage=pipeline_stage,
        sort_by=sort_by,
        sort_direction=sort_direction,
    )
    return [ProspectOut.from_model(p) for p in prospects]


@router.get("/{prospect_id}", response_model=ProspectOut)
def get_prospect(prospect_id: str, db: Session = Depends(get_db)):
    """Retrieve a single prospect dossier by ID."""
    p = ProspectService.get_prospect_by_id(db, prospect_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prospect with ID '{prospect_id}' not found.",
        )
    return ProspectOut.from_model(p)


@router.post("", response_model=ProspectOut, status_code=status.HTTP_201_CREATED)
def create_prospect(prospect_in: ProspectCreate, db: Session = Depends(get_db)):
    """Create a new prospect with automated deterministic baseline fit scoring."""
    p = ProspectService.create_prospect(db, prospect_in)
    return ProspectOut.from_model(p)


@router.patch("/{prospect_id}", response_model=ProspectOut)
def update_prospect(
    prospect_id: str,
    update_in: ProspectUpdate,
    db: Session = Depends(get_db),
):
    """Partially update an existing prospect."""
    p = ProspectService.update_prospect(db, prospect_id, update_in)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prospect with ID '{prospect_id}' not found.",
        )
    return ProspectOut.from_model(p)


@router.delete("/{prospect_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prospect(prospect_id: str, db: Session = Depends(get_db)):
    """Delete a prospect from the workspace."""
    success = ProspectService.delete_prospect(db, prospect_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prospect with ID '{prospect_id}' not found.",
        )
    return None


@router.patch("/{prospect_id}/stage", response_model=ProspectOut)
def update_prospect_stage(
    prospect_id: str,
    stage_in: ProspectStageUpdate,
    db: Session = Depends(get_db),
):
    """Transition prospect between pipeline stages and record audit trail."""
    p = ProspectService.update_stage(db, prospect_id, stage_in)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prospect with ID '{prospect_id}' not found.",
        )
    return ProspectOut.from_model(p)


@router.patch("/{prospect_id}/outcome", response_model=ProspectOut)
def update_prospect_outcome(
    prospect_id: str,
    outcome_in: ProspectOutcomeUpdate,
    db: Session = Depends(get_db),
):
    """Record or update outcome notes for a prospect."""
    p = ProspectService.update_outcome(db, prospect_id, outcome_in)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prospect with ID '{prospect_id}' not found.",
        )
    return ProspectOut.from_model(p)


@router.post("/import", response_model=ImportResponse)
async def import_prospects_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Import prospects from a validated CSV upload.
    - Strictly validates file extension (.csv) and content.
    - Validates required columns (company_name, domain, industry).
    - Collects row-level errors without executing or crashing.
    - Never executes arbitrary uploaded content.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are accepted for import.",
        )

    try:
        content_bytes = await file.read()
        # Decode as utf-8 or utf-8-sig
        content_text = content_bytes.decode("utf-8-sig")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read file content. Ensure the file is encoded in valid UTF-8.",
        )

    # Check for empty file
    if not content_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded CSV file is empty.",
        )

    reader = csv.DictReader(io.StringIO(content_text))
    if not reader.fieldnames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not parse CSV header. Ensure a header row exists.",
        )

    # Normalize fieldnames map
    normalized_headers = {h.strip().lower().replace(" ", "_"): h for h in reader.fieldnames}

    # Validate required fields (support variations)
    company_col = (
        normalized_headers.get("company_name")
        or normalized_headers.get("companyname")
        or normalized_headers.get("company")
    )
    domain_col = (
        normalized_headers.get("domain")
        or normalized_headers.get("website")
        or normalized_headers.get("url")
    )
    industry_col = normalized_headers.get("industry")

    if not company_col or not domain_col or not industry_col:
        missing = []
        if not company_col:
            missing.append("company_name (or company)")
        if not domain_col:
            missing.append("domain (or website)")
        if not industry_col:
            missing.append("industry")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required CSV column(s): {', '.join(missing)}.",
        )

    imported_prospects = []
    errors = []

    for row_idx, row in enumerate(reader, start=2):  # row 1 is header
        try:
            company_val = (row.get(company_col) or "").strip()
            domain_val = (row.get(domain_col) or "").strip()
            industry_val = (row.get(industry_col) or "").strip()

            if not company_val:
                errors.append(ImportErrorDetail(row=row_idx, error="Company name is empty."))
                continue
            if not domain_val:
                errors.append(ImportErrorDetail(row=row_idx, error="Domain is empty."))
                continue
            if not industry_val:
                errors.append(ImportErrorDetail(row=row_idx, error="Industry is empty."))
                continue

            sub_ind_col = normalized_headers.get("sub_industry") or normalized_headers.get("subindustry")
            sub_ind = (row.get(sub_ind_col) or "").strip() if sub_ind_col else ""

            emp_col = normalized_headers.get("employee_count") or normalized_headers.get("employees") or normalized_headers.get("size")
            emp_count = (row.get(emp_col) or "20-50 employees").strip() if emp_col else "20-50 employees"

            hq_col = normalized_headers.get("headquarters") or normalized_headers.get("location") or normalized_headers.get("hq")
            hq = (row.get(hq_col) or "Remote").strip() if hq_col else "Remote"

            summary_col = normalized_headers.get("summary") or normalized_headers.get("description")
            summary = (row.get(summary_col) or f"Imported prospect {company_val}.").strip() if summary_col else f"Imported prospect {company_val}."

            buyer_name_col = normalized_headers.get("buyer_name") or normalized_headers.get("contact_name")
            buyer_title_col = normalized_headers.get("buyer_title") or normalized_headers.get("contact_title")
            buyer_name = (row.get(buyer_name_col) or "Leadership Lead").strip() if buyer_name_col else "Leadership Lead"
            buyer_title = (row.get(buyer_title_col) or "Head of Operations").strip() if buyer_title_col else "Head of Operations"

            prospect_create = ProspectCreate(
                company_name=company_val,
                domain=domain_val,
                industry=industry_val,
                sub_industry=sub_ind,
                headquarters=hq,
                employee_count=emp_count,
                summary=summary,
                provenance="imported",
                pipeline_stage="to_research",
                target_buyer={"name": buyer_name, "title": buyer_title},
            )

            created = ProspectService.create_prospect(db, prospect_create)
            imported_prospects.append(ProspectOut.from_model(created))

        except Exception as e:
            errors.append(ImportErrorDetail(row=row_idx, error=f"Processing error: {str(e)}"))

    return ImportResponse(
        imported_count=len(imported_prospects),
        error_count=len(errors),
        errors=errors,
        prospects=imported_prospects,
    )
