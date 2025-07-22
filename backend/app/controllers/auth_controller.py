from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.auth_schema import LoginRequest
from app.services.auth_service import authenticate_user, generate_and_return_token
from app.core.database import SessionLocal
from app.utils.response import success_response, error_response

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