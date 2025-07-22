from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.routes import auth_route
from app.core.database import Base, engine
from app.models import user, attendance_session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs on startup
    Base.metadata.create_all(bind=engine)
    yield
    # This runs on shutdown (optional)
    # Example: db session close, cache clear etc.

app = FastAPI(lifespan=lifespan)

app.include_router(auth_route.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def read_root():
    return {"message": "Employee Record Management API"}

# Entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
