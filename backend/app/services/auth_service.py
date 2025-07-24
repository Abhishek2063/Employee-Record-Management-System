from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.hashing import verify_password
from app.utils.jwt_token import create_access_token
from app.models.attendance_session import AttendanceSession
from datetime import datetime, date
from app.schemas.auth_schema import TodayAttendanceSchema

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def generate_and_return_token(user: User, db: Session):
    token_data = {"sub": str(user.id), "role": user.role.value}
    token = create_access_token(token_data)

    user.access_token = token  # store token in DB
    db.commit()
    db.refresh(user)

    return {"access_token": token, "token_type": "bearer"}

def get_today_attendance(db: Session, user_id: int) -> TodayAttendanceSchema:
    today = date.today()

    sessions = db.query(AttendanceSession).filter(
        AttendanceSession.user_id == user_id,
        AttendanceSession.date == today
    ).order_by(AttendanceSession.punch_in.asc()).all()

    if not sessions:
        return TodayAttendanceSchema(
            first_punch_in=None,
            last_punch_out=None,
            next_action="punch_in"
        )

    first_punch_in = sessions[0].punch_in
    last_punch_out = None

    for session in reversed(sessions):
        if session.punch_out:
            last_punch_out = session.punch_out
            break

    last_session = sessions[-1]
    next_action = "punch_in" if last_session.punch_out else "punch_out"

    return TodayAttendanceSchema(
        first_punch_in=first_punch_in,
        last_punch_out=last_punch_out,
        next_action=next_action
    )