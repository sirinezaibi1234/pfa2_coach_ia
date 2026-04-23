from app.models.user import User
from app import db
from werkzeug.security import generate_password_hash

# 📋 get users
def get_all_users():
    return User.query.all()

# ❌ delete user
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return True
    return False

# 🔄 toggle active
def toggle_user(user_id):
    user = User.query.get(user_id)
    if user:
        user.is_active = not user.is_active
        db.session.commit()
        return user
    return None

# ✏️ update user
def update_user(user_id, data):
    user = User.query.get(user_id)
    if user:
        user.name = data.get("name", user.name)
        user.email = data.get("email", user.email)
        db.session.commit()
        return user
    return None

# 🔑 reset password
def reset_password(user_id):
    user = User.query.get(user_id)
    if user:
        new_password = "123456"
        user.password = generate_password_hash(new_password)
        db.session.commit()
        return new_password
    return None

# 📊 stats
def get_stats():
    total = User.query.count()
    active = User.query.filter_by(is_active=True).count()
    inactive = User.query.filter_by(is_active=False).count()

    return {
        "totalUsers": total,
        "activeUsers": active,
        "inactiveUsers": inactive
    }