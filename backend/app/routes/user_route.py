from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.controllers.user_controller import get_all_users
from app.core.database import get_db
from app.middlewares.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/")
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    search: Optional[str] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_users(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )