from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.hashing import verify_password
from app.utils.jwt_token import create_access_token

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