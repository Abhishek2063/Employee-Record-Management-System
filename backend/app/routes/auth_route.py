from fastapi import APIRouter, Depends
from app.schemas.auth_schema import LoginRequest
from app.controllers.auth_controller import login_controller, get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return login_controller(data, db)