from app.models.user import User, UserRole
from app.core.database import SessionLocal, engine, Base
from app.utils.hashing import hash_password
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed_users():
    users = [
        {"name": "Super Admin", "email": "superadmin@yopmail.com", "role": UserRole.super_admin},
        {"name": "Admin", "email": "admin@yopmail.com", "role": UserRole.admin},
        {"name": "Employee", "email": "employee@yopmail.com", "role": UserRole.employee},
    ]

    for u in users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user = User(
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password("Test@1234"),
                role=u["role"]
            )
            db.add(user)
    
    db.commit()
    db.close()
    print("Seeding completed.")

if __name__ == "__main__":
    seed_users()