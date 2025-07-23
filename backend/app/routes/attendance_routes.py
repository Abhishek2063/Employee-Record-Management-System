from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.attendance_service import punch_in, handle_punch_out
from app.middlewares.auth import get_current_user
from app.models.user import User
from app.controllers.attendance_controller import get_user_attendance

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/punch-in")
def punch_in_controller(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return punch_in(current_user.id, db)

@router.post("/punch-out")
def punch_out_controller(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return handle_punch_out(current_user.id, db)


@router.get("/me")
def get_my_attendance(
    date: int = None,
    month: int = None,
    year: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_attendance(current_user.id, db, date, month, year)