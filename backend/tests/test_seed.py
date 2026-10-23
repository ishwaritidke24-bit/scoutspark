from backend.app.seed import seed_database
from backend.app.models import ProspectModel, ICPModel


def test_seed_idempotency(db_session, client):
    # Check seeded prospects count (8 seeded by fixture)
    initial_count = db_session.query(ProspectModel).count()
    assert initial_count == 8

    # Modify an existing seeded prospect
    p = db_session.query(ProspectModel).filter(ProspectModel.id == "prospect-01").first()
    p.company_name = "KiteMetrics Modified by User"
    db_session.commit()

    # Re-run seed process
    seed_database(db_session)

    # Count must remain exactly 8 (no duplicates created)
    after_count = db_session.query(ProspectModel).count()
    assert after_count == 8

    # User edit must be preserved (not overwritten by seed)
    p_check = db_session.query(ProspectModel).filter(ProspectModel.id == "prospect-01").first()
    assert p_check.company_name == "KiteMetrics Modified by User"


def test_seed_icp_exists(db_session):
    icp = db_session.query(ICPModel).first()
    assert icp is not None
    assert icp.company_name == "ScoutSpark AI"
    assert len(icp.target_industries) == 5
