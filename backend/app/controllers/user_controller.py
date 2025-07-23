from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.models.user import User
from app.schemas.user_schema import UserSchema
from app.utils.response import success_response

def get_all_users(db: Session, skip: int, limit: int, search: str, sort_by: str, sort_order: str):
    query = db.query(User)

    if search:
        query = query.filter(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )

    # Handle sorting dynamically and safely
    sort_column = getattr(User, sort_by, None)
    if sort_column is not None:
        sort_column = desc(sort_column) if sort_order.lower() == "desc" else asc(sort_column)
        query = query.order_by(sort_column)
    else:
        query = query.order_by(desc(User.name))

    total = query.count()
    users = query.offset(skip).limit(limit).all()
    user_data = [UserSchema.from_orm(user) for user in users]

    return success_response("Users fetched successfully", {
        "total": total,
        "skip": skip,
        "limit": limit,
        "users": user_data
    })