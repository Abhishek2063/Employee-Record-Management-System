from sqlalchemy.orm import Session
from datetime import date, datetime
from app.models.attendance_session import AttendanceSession
from app.utils.response import error_response, success_response
from fastapi import HTTPException
from datetime import datetime, date as date_type
from collections import defaultdict

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
    
    
def fetch_user_attendance(user_id: int, db: Session, date=None, month=None, year=None):
    now = datetime.utcnow()
    year = year or now.year
    month = month or now.month

    if date:
        # Filter by specific date
        target_date = datetime(year, month, date).date()
        sessions = db.query(AttendanceSession).filter_by(user_id=user_id, date=target_date).all()
    else:
        # Filter by month and year
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date()
        else:
            end_date = datetime(year, month + 1, 1).date()

        sessions = db.query(AttendanceSession).filter(
            AttendanceSession.user_id == user_id,
            AttendanceSession.date >= start_date,
            AttendanceSession.date < end_date
        ).all()

    # Group sessions by date
    grouped = defaultdict(list)
    for session in sessions:
        grouped[session.date].append(session)

    response = []
    for session_date, records in grouped.items():
        records = sorted(records, key=lambda s: s.punch_in)

        first_punch_in = records[0].punch_in
        last_punch_out = next((r.punch_out for r in reversed(records) if r.punch_out), None)

        total_hours = 0
        if first_punch_in and last_punch_out:
            delta = last_punch_out - first_punch_in
            total_hours = round(delta.total_seconds() / 3600, 2)

        response.append({
            "date": session_date,
            "first_punch_in": first_punch_in,
            "last_punch_out": last_punch_out,
            "total_hours": total_hours,
            "sessions": [
                {
                    "punch_in": r.punch_in,
                    "punch_out": r.punch_out,
                    "duration": r.duration
                } for r in records
            ]
        })

    # Sort by date descending
    response.sort(key=lambda x: x["date"], reverse=True)
    return response