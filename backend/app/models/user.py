# In app/models/user.py

from sqlalchemy import Column, Integer, String, Enum
from app.core.database import Base
from sqlalchemy.orm import relationship
import enum
from app.models.attendance_session import AttendanceSession  # <-- Import directly here

class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    employee = "employee"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.employee)
    access_token = Column(String(255), nullable=True)

    attendance_sessions = relationship(AttendanceSession, back_populates="user")  # Use class directly
