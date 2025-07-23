from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    class Config:
        orm_mode = True
        from_attributes = True