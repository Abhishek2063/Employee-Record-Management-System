from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.utils.response import success_response, error_response
from app.schemas.attendance_session import PunchInRequest
from app.services.attendance_service import punch_in, handle_punch_out, fetch_user_attendance, fetch_all_attendance
from app.middlewares.auth import get_current_user
from typing import Optional
from datetime import date
from app.schemas.user_schema import UserSchema


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
