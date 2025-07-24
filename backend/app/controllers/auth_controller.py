from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.auth_schema import LoginRequest
from app.services.auth_service import authenticate_user, generate_and_return_token, get_today_attendance
from app.core.database import SessionLocal
from app.utils.response import success_response, error_response
from app.middlewares.auth import get_current_user
from app.models.user import User
from app.schemas.auth_schema import UserSchema

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def login_controller(login_data: LoginRequest, db: Session):
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail=error_response("Invalid email or password", 401))
    
    token = generate_and_return_token(user,db)
    return success_response("Login successful", token, 200)

def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_data = UserSchema.from_orm(user)
    attendance = get_today_attendance(db, user.id)
    user_data.today_attendance = attendance
    return success_response("User details fetched successfully", user_data.dict(), 200)

def logout_user(user: User, db: Session):
    user.access_token = None
    db.commit()
    return success_response("Logout successful", {}, 200)