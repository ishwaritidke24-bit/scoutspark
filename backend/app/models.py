from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    Boolean,
    DateTime,
    JSON,
    func,
)
from datetime import datetime, timezone
from .database import Base


class ProspectModel(Base):
    __tablename__ = "prospects"

    id = Column(String, primary_key=True, index=True)
    company_name = Column(String, nullable=False, index=True)
    domain = Column(String, nullable=False, index=True)
    industry = Column(String, nullable=False, index=True)
    sub_industry = Column(String, nullable=False)
    headquarters = Column(String, nullable=False)
    employee_count = Column(String, nullable=False)
    stage = Column(String, nullable=False)
    fit_score = Column(Integer, nullable=False, index=True)
    fit_level = Column(String, nullable=False)
    fit_reasons = Column(JSON, nullable=False, default=list)
    summary = Column(Text, nullable=False)
    pipeline_stage = Column(String, nullable=False, index=True, default="to_research")
    
    # Evidence & Hypotheses
    observed_facts = Column(JSON, nullable=False, default=list)
    hypotheses = Column(JSON, nullable=False, default=list)
    missing_information = Column(JSON, nullable=False, default=list)
    uncertainty_indicators = Column(JSON, nullable=False, default=list)
    
    # Strategy & Persona
    recommended_angle = Column(JSON, nullable=False, default=dict)
    target_buyer = Column(JSON, nullable=False, default=dict)
    email_draft = Column(JSON, nullable=False, default=dict)
    
    # Metadata & Tracking
    tags = Column(JSON, nullable=False, default=list)
    outcome_notes = Column(Text, nullable=True)
    provenance = Column(String, nullable=False, default="demo")
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class ICPModel(Base):
    __tablename__ = "ideal_customer_profiles"

    id = Column(Integer, primary_key=True, default=1)
    company_name = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    company_description = Column(Text, nullable=False)
    value_proposition = Column(Text, nullable=False)
    target_industries = Column(JSON, nullable=False, default=list)
    target_roles = Column(JSON, nullable=False, default=list)
    target_geographies = Column(JSON, nullable=False, default=list)
    company_size_ranges = Column(JSON, nullable=False, default=list)
    funding_stages = Column(JSON, nullable=False, default=list)
    exclusions = Column(JSON, nullable=False, default=list)
    primary_pain_point = Column(Text, nullable=False)
    last_updated = Column(String, nullable=False)


class ActivityModel(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(String, nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    prospect_name = Column(String, nullable=True)
    user = Column(String, nullable=False, default="Founder")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class OutreachDraftModel(Base):
    __tablename__ = "outreach_drafts"

    id = Column(String, primary_key=True, index=True)
    prospect_id = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    customization_variables = Column(JSON, nullable=False, default=dict)
    is_approved = Column(Boolean, nullable=False, default=False)
    approved_at = Column(String, nullable=True)
    approved_by = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
