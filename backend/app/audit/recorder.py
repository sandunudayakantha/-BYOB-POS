import asyncio
from contextlib import asynccontextmanager

_audit_queue: asyncio.Queue = asyncio.Queue()

def record_audit_event(event: dict) -> None:
    try:
        _audit_queue.put_nowait(event)
    except Exception:
        pass

def register_invoice_audit() -> None:
    # Hook for invoice audit recording if invoices are processed
    pass
