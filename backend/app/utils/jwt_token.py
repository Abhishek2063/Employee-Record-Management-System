from datetime import datetime, timedelta
from jose import jwt
from app.config.settings import JWT_SECRET, JWT_ALGORITHM

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=8)):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)