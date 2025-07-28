from fastapi import Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.utils.response import success_response, error_response
from app.schemas.attendance_session import PunchInRequest
from app.services.attendance_service import punch_in, handle_punch_out, fetch_user_attendance, fetch_all_attendance, get_attendance_export
from app.middlewares.auth import get_current_user
from typing import Optional
from datetime import date,datetime
from app.schemas.user_schema import UserSchema
from app.models.user import User


def punch_in_controller(request: PunchInRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    try:
        session = punch_in(user, db, request.date)
        return success_response("Punch-in successful", session)
    except Exception as e:
        return error_response(str(e), status_code=400)
    
    
def punch_out(user_id: int, db):
    try:
        result = handle_punch_out(user_id, db)
        return success_response("Punch out successful", result)
    except Exception as e:
        return error_response(str(e), status_code=400)
    

def get_user_attendance(user_id: int, db, date=None, month=None, year=None):
    try:
        result = fetch_user_attendance(user_id, db, date, month, year)
        return success_response("Attendance fetched successfully", result)
    except Exception as e:
        return error_response(str(e), status_code=400)
   
    
def get_all_attendance(selected_date: Optional[date], current_user: UserSchema):
    try:
        result = fetch_all_attendance(selected_date)
        return success_response("Users attendance fetched successfully", result)
    except Exception as e:
        return error_response(str(e), status_code=500)



def export_my_attendance_controller(format: str, selected_date: str, db: Session, current_user: User):
    try:
        selected = datetime.strptime(selected_date, "%Y-%m-%d").date() if selected_date else date.today()
        file_url = get_attendance_export(db, current_user, format, selected, export_all=False)
        return success_response("Your attendance exported successfully", {"file_url": file_url})
    except Exception as e:
        return error_response(str(e))

def export_all_attendance_controller(format: str, selected_date: str, db: Session, current_user: User):
    try:
        selected = datetime.strptime(selected_date, "%Y-%m-%d").date() if selected_date else date.today()
        file_url = get_attendance_export(db, current_user, format, selected, export_all=True)
        return success_response("All user attendance exported successfully", {"file_url": file_url})
    except Exception as e:
        return error_response(str(e))