from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.attendance_service import punch_in
from app.middlewares.auth import get_current_user
from app.models.user import User


router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/punch-in")
def punch_in_controller(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return punch_in(current_user.id, db)

