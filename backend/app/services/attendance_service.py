from sqlalchemy.orm import Session
from datetime import date, datetime
from app.models.attendance_session import AttendanceSession
from app.utils.response import error_response, success_response

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
