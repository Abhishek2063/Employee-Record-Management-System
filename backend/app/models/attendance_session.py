from sqlalchemy import Column, Integer, ForeignKey, Date, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    punch_in = Column(DateTime, nullable=False)
    punch_out = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)  # In hours (e.g., 2.5 = 2h 30m)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="attendance_sessions")
