from fastapi import FastAPI


def create_app() -> FastAPI:
    """Create and configure a FastAPI application instance."""
    app = FastAPI(title="Strategy Builder API")

    @app.get("/health", tags=["Health"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
