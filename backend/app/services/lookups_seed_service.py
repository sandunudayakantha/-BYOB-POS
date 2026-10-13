import logging
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

def sync_lookups_seed(db: Session) -> None:
    logger.info("lookups_seed_completed")
