from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from contextlib import asynccontextmanager

from app.routes import auth_route,user_route, attendance_routes
from app.core.database import Base, engine
from app.models import user, attendance_session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown tasks (if needed)
    # Example: close DB connections, clean up cache, etc.

app = FastAPI(
    title="Employee Record Management API",
    description="API for managing employee records and attendance with role-based access.",
    version="1.0.0",
    lifespan=lifespan
)

# Serve static files for download
app.mount("/exports", StaticFiles(directory="exports"), name="exports")

# Add CORS (optional)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_route.router, prefix="/auth", tags=["Auth"])
app.include_router(user_route.router, prefix="/user", tags=["User"])
app.include_router(attendance_routes.router)

# Root route
@app.get("/")
def read_root():
    return {"message": "Welcome to the Employee Record Management API"}

# Swagger Bearer Token Authorization
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation.setdefault("security", [{"BearerAuth": []}])
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
