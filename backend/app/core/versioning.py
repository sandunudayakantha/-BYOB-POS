from fastapi import APIRouter, FastAPI

class APIVersioning:
    @staticmethod
    def register_versioned_router(app: FastAPI, router: APIRouter, version: str = "v1") -> None:
        app.include_router(router, prefix=f"/api/{version}")
