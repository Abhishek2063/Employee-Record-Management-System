from sqlalchemy.orm import Session
from datetime import date, datetime
from app.models.attendance_session import AttendanceSession
from app.utils.response import error_response, success_response
from fastapi import HTTPException

def punch_in(user_id: int, db: Session):
    today = date.today()

    # Check if there's an existing session today without punch_out
    existing_session = db.query(AttendanceSession).filter(
        AttendanceSession.user_id == user_id,
        AttendanceSession.date == today,
        AttendanceSession.punch_out == None
    ).first()

    if existing_session:
        return error_response("You have already punched in and not punched out yet.", 400)

    # Otherwise, create a new punch-in session
    new_session = AttendanceSession(
        user_id=user_id,
        date=today,
        punch_in=datetime.utcnow()
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return success_response("Punched in successfully", {
        "session_id": new_session.id,
        "punch_in": new_session.punch_in
    })


def handle_punch_out(user_id: int, db: Session):
    today = datetime.utcnow().date()

    # Get today's last punch-in session without punch-out
    session = db.query(AttendanceSession).filter_by(
        user_id=user_id,
        date=today,
        punch_out=None
    ).order_by(AttendanceSession.punch_in.desc()).first()

    if not session:
        raise HTTPException(status_code=404, detail="No active punch-in session found for today.")

    now = datetime.utcnow()
    session.punch_out = now

    # Calculate duration in hours
    delta = now - session.punch_in
    session.duration = round(delta.total_seconds() / 3600, 2)

    db.commit()
    db.refresh(session)

    return {
        "punch_in": session.punch_in,
        "punch_out": session.punch_out,
        "duration": session.duration
    }