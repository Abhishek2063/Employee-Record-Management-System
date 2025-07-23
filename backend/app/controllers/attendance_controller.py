from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.utils.response import success_response, error_response
from app.schemas.attendance_session import PunchInRequest
from app.services.attendance_service import punch_in
from app.middlewares.auth import get_current_user


def punch_in_controller(request: PunchInRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    try:
        session = punch_in(user, db, request.date)
        return success_response("Punch-in successful", session)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))