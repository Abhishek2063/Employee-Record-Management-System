
# 🧾 Employee Record Management System

A role-based employee record and attendance tracking system built with **React (Frontend)** and **FastAPI (Backend)**.  
It includes three user types: **Super Admin**, **Admin**, and **Employee**, with seeded data to manage access and functionality.

---

## 📁 Project Structure

```

employee-record-system/
├── backend/         # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/        # React frontend
│   ├── src/
│   ├── public/
│   └── ...
├── .gitignore
└── README.md

````

---

## 👥 User Roles

- **Super Admin**  
  - Full access to manage Admins and Employees  
  - View all attendance reports

- **Admin**  
  - Can manage Employees  
  - Can view and export attendance data

- **Employee**  
  - Can punch in/out  
  - View their own attendance and profile

---

## 🧩 Features

### ✅ Authentication
- Login via email and password
- JWT-based token handling
- Role-based route access

### ✅ Attendance Management
- Punch In / Punch Out
- Track daily working hours
- View attendance records (filtered by date/employee)

### ✅ User Management
- Create/update/delete users (role-based)
- View employee list

### ✅ Reports
- Attendance reports by date/employee
- Export CSV/PDF (optional)

### ✅ Profile
- View/edit personal profile details

---

## 🚀 Tech Stack

| Layer        | Technology      |
|--------------|-----------------|
| Frontend     | React.js        |
| Backend      | FastAPI         |
| Database     | MySQL (ORM: SQLAlchemy) |
| Auth         | JWT             |

---

## 🛠️ Installation Guide

### 📦 Backend Setup

```bash
cd backend
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
````

### 🌐 Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 📌 Future Enhancements

* Email verification and forgot password
* Activity logs for admin actions
* Office hours setting module
* Notifications or alerts

---

## 👨‍💻 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📝 License

This project is licensed under the MIT License.

---

## ✨ Author

**Abhishek Garg**
Senior Software Engineer
GitHub: [@Abhishek2063](https://github.com/Abhishek2063)

---

