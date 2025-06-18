# WriterReader Blog Platform

A modern, full-stack blog platform built with Django (backend) and React (frontend). Features include user roles, authentication, rich text editing, categories, tags, bookmarks, likes, notifications, following, and a personalized feed—all with a beautiful, responsive UI.

## Features

- User registration/login with roles (writer/reader)
- Profile page with avatar upload and password change
- Blog CRUD for writers, with category/tag assignment
- Rich text editing (Lexical) with image upload
- Comment CRUD, search/filter, and pagination
- Bookmarks and likes (with interactive buttons)
- Real-time notifications for comments/likes
- User following and personalized "Following Feed"
- Follower/following counts on user cards
- Modern, responsive card-based UI

## Tech Stack

- **Backend:** Django, Django REST Framework
- **Frontend:** React, Vite, Lexical
- **Database:** SQLite (default, easy to swap)

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt  # (create this if not present: django, djangorestframework, django-cors-headers)
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

### Default URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/

## Usage
- Register as a writer or reader
- Writers can create, edit, and delete blogs
- Readers can follow writers, like/bookmark blogs, and comment
- All users can manage their profile and see notifications



## License
MIT

---

