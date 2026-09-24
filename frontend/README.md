# 📞 Phonebook App

A full-stack contact management application built with **FastAPI, PostgreSQL, Vue 3, and Docker**.

The application allows users to create, view, update, search, paginate, and delete contacts through a modern responsive web interface.

---

## ✨ Features

### Required Features

- Create contacts
- View all contacts
- View individual contact details
- Update contacts
- Delete contacts
- Phone number validation
- Email validation
- PostgreSQL database
- RESTful FastAPI backend
- Vue 3 frontend
- Axios API communication
- Dockerized backend, frontend, and database

### Optional Enhancements

- 🔍 Search contacts by name or phone number
- 📄 Pagination
- 📦 Pinia state management
- 🧪 Backend unit tests
- 🧪 Frontend unit tests
- ⚙️ GitHub Actions CI/CD

---

## 🛠️ Technology Stack

### Frontend

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Vitest
- Vue Test Utils
- jsdom

### Backend

- Python 3.12
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Uvicorn
- Pytest

### Deployment

- Docker
- Docker Compose
- Nginx
- GitHub Actions

---

## 📁 Project Structure

```text
phonebook-app/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── tests/
│   │   ├── test_health.py
│   │   └── test_contacts.py
│   │
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .gitignore
├── docker-compose.yml
└── README.md