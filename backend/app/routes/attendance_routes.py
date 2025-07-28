from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.attendance_service import punch_in, handle_punch_out
from app.middlewares.auth import get_current_user
from app.models.user import User
from app.controllers.attendance_controller import get_user_attendance,get_all_attendance, export_my_attendance_controller, export_all_attendance_controller
from typing import Optional
from datetime import date  as Date
from app.schemas.user_schema import UserSchema

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

@router.get("/", summary="Get all users' attendance")
def get_attendance_report(
    selected_date: Optional[Date] = Query(None),
    current_user: UserSchema = Depends(get_current_user)
):
    return get_all_attendance(selected_date, current_user)



@router.get("/download/me")
def download_my_attendance(
    request: Request,
    format: str = Query("csv", enum=["csv", "excel", "pdf"]),
    selected_date: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return export_my_attendance_controller(format, selected_date, db, current_user)

@router.get("/download/all")
def download_all_attendance(
    request: Request,
    format: str = Query("csv", enum=["csv", "excel", "pdf"]),
    selected_date: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return export_all_attendance_controller(format, selected_date, db, current_user)