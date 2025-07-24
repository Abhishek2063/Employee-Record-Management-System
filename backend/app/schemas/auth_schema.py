from pydantic import BaseModel, EmailStr, field_validator,ConfigDict
import re
from enum import Enum
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[@$!%*#?&]", value):
            raise ValueError("Password must contain at least one special character.")
        return value



class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class UserRole(str, Enum):
    super_admin = "super_admin"
    admin = "admin"
    employee = "employee"
    

class TodayAttendanceSchema(BaseModel):
    first_punch_in: Optional[datetime] = None
    last_punch_out: Optional[datetime] = None
    next_action: str

class UserSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    today_attendance: Optional[TodayAttendanceSchema] = None

    class Config:
        from_attributes = True