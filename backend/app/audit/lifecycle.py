from contextlib import asynccontextmanager

@asynccontextmanager
async def invoice_audit_lifespan():
    yield
