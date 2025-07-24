from fastapi import APIRouter, Depends
from app.schemas.auth_schema import LoginRequest
from app.controllers.auth_controller import login_controller, get_db, get_me, logout_user
from sqlalchemy.orm import Session
from app.middlewares.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return login_controller(data, db)

@router.get("/me")
def me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_me(user, db)

@router.post("/logout")
def logout(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return logout_user(user, db)