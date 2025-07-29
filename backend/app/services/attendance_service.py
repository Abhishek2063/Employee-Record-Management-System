from sqlalchemy.orm import Session,joinedload
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date, datetime
from app.models.attendance_session import AttendanceSession
from app.utils.response import error_response, success_response
from fastapi import HTTPException
from collections import defaultdict
from app.core.database import get_db
from app.models.user import User
from pytz import timezone
from app.utils.file_exporter import (
    get_export_filename,
    export_to_csv,
    export_to_excel,
    export_to_pdf
)

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

def fetch_all_attendance(selected_date: Optional[date]):
        session = next(get_db())

        if not selected_date:
            selected_date = date.today()

        users = session.query(User).options(
            joinedload(User.attendance_sessions)
        ).all()

        results = []
        for user in users:
            sessions = [
                s for s in user.attendance_sessions
                if s.date == selected_date
            ]

            if sessions:
                punch_ins = [s.punch_in for s in sessions]
                punch_outs = [s.punch_out for s in sessions if s.punch_out]

                first_punch_in = min(punch_ins) if punch_ins else None
                last_punch_out = max(punch_outs) if punch_outs else None

                total_duration = (
                    (last_punch_out - first_punch_in).total_seconds() / 3600
                    if first_punch_in and last_punch_out else 0
                )

                session_data = [
                    {
                        "punch_in": s.punch_in,
                        "punch_out": s.punch_out,
                        "duration": s.duration,
                    }
                    for s in sessions
                ]
            else:
                first_punch_in = None
                last_punch_out = None
                total_duration = None
                session_data = []

            results.append({
                "user_id": user.id,
                "name": user.name,
                "email": user.email,
                "date": selected_date,
                "first_punch_in": first_punch_in,
                "last_punch_out": last_punch_out,
                "total_duration": round(total_duration, 2) if total_duration is not None else None,
                "sessions": session_data
            })

        session.close()
        return results
    
def format_attendance_data(records):
    formatted = []
    for user, sessions in records:
        for session in sessions:
            formatted.append({
                "User ID": user.id,
                "Name": user.name,
                "Email": user.email,
                "Date": session.date.strftime('%Y-%m-%d'),
                "Punch In": session.punch_in.strftime('%Y-%m-%d %H:%M:%S'),
                "Punch Out": session.punch_out.strftime('%Y-%m-%d %H:%M:%S') if session.punch_out else "N/A",
                "Duration (hours)": round(session.duration, 2) if session.duration else 0
            })
    return formatted

def convert_utc_to_ist(utc_datetime):
    """Convert UTC datetime to Indian Standard Time"""
    if utc_datetime is None:
        return None
    utc_tz = timezone('UTC')
    ist_tz = timezone('Asia/Kolkata')
    
    # If datetime is naive, assume it's UTC
    if utc_datetime.tzinfo is None:
        utc_datetime = utc_tz.localize(utc_datetime)
    
    return utc_datetime.astimezone(ist_tz)

def get_attendance_export(db: Session, user: User, export_format: str, selected_date: date, export_all=False):
    if export_format not in ["csv", "excel", "pdf"]:
        raise HTTPException(status_code=400, detail="Invalid export format")

    # Handle single user (employee) or all users (admin)
    if not export_all:
        users_data = db.query(User).options(
            joinedload(User.attendance_sessions)
        ).filter(User.id == user.id).all()
    else:
        users_data = db.query(User).options(
            joinedload(User.attendance_sessions)
        ).order_by(User.name.asc()).all()  # Order by name ascending

    # Prepare data for selected date
    export_data = []
    
    for user_obj in users_data:
        # Filter sessions for the selected date and order by punch_in time (ascending)
        sessions = [
            s for s in user_obj.attendance_sessions
            if s.date == selected_date
        ]
        sessions.sort(key=lambda x: x.punch_in if x.punch_in else datetime.min)

        if sessions:
            # Calculate total time worked
            total_duration = sum(s.duration for s in sessions if s.duration) or 0
            
            # First entry with user details
            first_session = sessions[0]
            
            # Convert UTC times to IST
            punch_in_ist = convert_utc_to_ist(first_session.punch_in)
            punch_out_ist = convert_utc_to_ist(first_session.punch_out) if first_session.punch_out else None
            
            punch_out_status = "In Progress" if not punch_out_ist else punch_out_ist.strftime('%H:%M:%S')
            duration = round(first_session.duration, 2) if first_session.duration else 0
            
            export_data.append({
                "Date": first_session.date.strftime('%Y-%m-%d'),
                "Name": user_obj.name,
                "Email": user_obj.email,
                "Punch In": punch_in_ist.strftime('%H:%M:%S') if punch_in_ist else "N/A",
                "Punch Out": punch_out_status,
                "Duration (hours)": duration,
                "Total Hours": round(total_duration, 2),
                "is_first_entry": True  # Flag for formatting
            })
            
            # Additional entries for multiple punch-ins/outs (merged rows)
            for session in sessions[1:]:
                # Convert UTC times to IST
                punch_in_ist = convert_utc_to_ist(session.punch_in)
                punch_out_ist = convert_utc_to_ist(session.punch_out) if session.punch_out else None
                
                punch_out_status = "In Progress" if not punch_out_ist else punch_out_ist.strftime('%H:%M:%S')
                duration = round(session.duration, 2) if session.duration else 0
                
                export_data.append({
                    "Date": "",  # Empty for merged cells
                    "Name": "",  # Empty for merged cells
                    "Email": "",  # Empty for merged cells
                    "Punch In": punch_in_ist.strftime('%H:%M:%S') if punch_in_ist else "N/A",
                    "Punch Out": punch_out_status,
                    "Duration (hours)": duration,
                    "Total Hours": "",  # Empty for merged cells
                    "is_first_entry": False
                })
        else:
            # User with no attendance (only for export_all)
            if export_all:
                export_data.append({
                    "Date": selected_date.strftime('%Y-%m-%d'),
                    "Name": user_obj.name,
                    "Email": user_obj.email,
                    "Punch In": "Absent",
                    "Punch Out": "Absent",
                    "Duration (hours)": 0,
                    "Total Hours": 0,
                    "is_first_entry": True
                })

    if not export_data:
        raise HTTPException(status_code=404, detail="No attendance records found for selected date.")

    filename = get_export_filename("attendance", export_format)

    if export_format == "csv":
        export_to_csv(export_data, filename)
    elif export_format == "excel":
        export_to_excel(export_data, filename)
    else:
        export_to_pdf(export_data, filename)

    return f"/{filename}"