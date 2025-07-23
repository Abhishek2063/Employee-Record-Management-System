from pydantic import BaseModel
from datetime import datetime, date

class PunchInRequest(BaseModel):
    date: date

class AttendanceSessionResponse(BaseModel):
    id: int
    user_id: int
    date: date
    punch_in: datetime

    class Config:
        orm_mode = True
        from_attributes = True
        