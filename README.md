# 📱 Phonebook Application

A full-stack Phonebook application for managing contacts: a modern **Vue 3** frontend, an **ASP.NET Core 8 (.NET)** REST API, and **PostgreSQL** — containerized with Docker Compose.

The application supports user registration/login (JWT), creating, viewing, updating, deleting, searching, and filtering contacts. The frontend is served together with the API behind a single Nginx reverse proxy.

---

## 🚀 Features

* User registration, login, logout (JWT Bearer)
* Profile management (name, password change)
* Create / view / update / delete contacts
* Search contacts by name or phone number
* Filter by category (`WORK`, `FAMILY`, `FRIEND`), by e-mail presence, by date range
* Sorting (`newest`, `oldest`, `name_asc`, `name_desc`)
* Pagination for contact lists
* Bulk delete (up to 100 at a time)
* Client-side contact import / export
* Phone number, e-mail, and category validation
* Light + dark themes, responsive Vue 3 frontend
* Frontend testing with Vitest, CI with GitHub Actions

---

## 🏗️ Technology Stack

### Frontend

* Vue 3 + Vite
* Vue Router, Pinia, Axios
* Vitest + Vue Test Utils
* Nginx (production server + API reverse proxy)

### Backend

* C# / ASP.NET Core 8 Web API
* Entity Framework Core + Npgsql (PostgreSQL)
* JWT Bearer authentication (HS512/HS384/HS256 by key length)
* Argon2id password hashing
* Swagger / OpenAPI (Swashbuckle)

### DevOps

* Docker + Docker Compose
* GitHub Actions
* PostgreSQL 16

---

## 📂 Project Structure

```text
phonebook-app/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend-dotnet/
│   ├── Configuration/        # (reserved) JWT/settings helpers
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ContactsController.cs
│   │   └── HealthController.cs
│   ├── Data/
│   │   ├── AppDbContext.cs   # EF Core mapping (existing tables)
│   │   ├── DbInitializer.cs  # schema guard + demo-account seeder
│   │   └── FakeDataGenerator.cs
│   ├── DTOs/
│   │   └── DTOs.cs
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs
│   ├── Models/
│   │   ├── User.cs
│   │   └── Contact.cs
│   ├── Repositories/
│   │   └── Repositories.cs
│   ├── Services/
│   │   ├── ApiException.cs
│   │   ├── JwtService.cs
│   │   └── PasswordService.cs
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── PhoneBookApi.csproj
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── router/
│   │   ├── services/         # axios client (baseURL: /api)
│   │   ├── stores/
│   │   ├── styles/
│   │   └── views/
│   ├── Dockerfile
│   ├── nginx.conf            # SPA + /api/* reverse proxy on :80
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 🔄 Application Architecture

```text
                    ┌──────────────────────┐
                    │      FRONTEND        │
                    │   Vue 3 + Vite       │
                    │   Nginx on :80       │
                    │   /  → SPA           │
                    │   /api/* → backend   │
                    └──────────┬───────────┘
                               │
                               │ HTTP/REST (same port :80)
                               ▼
                    ┌──────────────────────┐
                    │    ASP.NET CORE 8    │
                    │    .NET backend      │
                    │    internal :8000    │
                    │    container:        │
                    │ phonebook-dotnet-    │
                    │ backend              │
                    └──────────┬───────────┘
                               │
                               │ EF Core + Npgsql
                               ▼
                    ┌──────────────────────┐
                    │     POSTGRESQL 16    │
                    │ container:           │
                    │ phonebook-postgres   │
                    │ db: phonebook        │
                    └──────────────────────┘
```

Docker Compose manages the PostgreSQL, backend, and frontend services. The backend is **not** published to the host — everything goes through port `:80`.

---

## 🔌 REST API

All API routes live under `/api` (same origin in production and in `npm run dev`). Protected routes require:

```http
Authorization: Bearer <access_token>
```

Error responses always look like:

```json
{ "detail": "…", "message": "…" }
```

| Existing Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | no | `{"api":"online","database":"online"}` |
| `/api/auth/register` | POST | no | Register → 201 `{access_token, token_type, user}` |
| `/api/auth/login` | POST | no | Login → 200 `{access_token, token_type, user}` |
| `/api/auth/me` | GET | yes | Current user |
| `/api/auth/me` | PATCH | yes | Update name → 200 user |
| `/api/auth/me/password` | PATCH | yes | Change password → 204 |
| `/api/contacts` | GET | yes | List (search / filter / sort / paginate) |
| `/api/contacts` | POST | yes | Create → 201 contact |
| `/api/contacts/{id}` | GET | yes | Single contact (404 if missing/foreign) |
| `/api/contacts/{id}` | PUT | yes | Update → 200 contact |
| `/api/contacts/{id}` | DELETE | yes | Delete → 200 `{message, id}` |
| `/api/contacts/bulk-delete` | POST | yes | `{ids:[…]}` → 200 `{deleted:n}` (max 100) |

### List query parameters

| Parameter | Description | Example |
|---|---|---|
| `search` | Matches name or phone (case-insensitive) | `?search=liam` |
| `category` | Single category (case-insensitive) | `?category=WORK` |
| `categories` | Comma-separated list | `?categories=WORK,FRIEND` |
| `sort` | `newest` (default), `oldest`, `name_asc`, `name_desc` | `?sort=name_asc` |
| `has_email` | `true` / `false` | `?has_email=true` |
| `date_from` / `date_to` | `yyyy-MM-dd` (from inclusive, to whole day) | `?date_from=2025-01-01` |
| `page` | 1-based page (default `1`) | `?page=2` |
| `page_size` | 1–100 (default `8`) | `?page_size=20` |

List responses look like:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 8,
  "total_pages": 1,
  "category": null,
  "sort": "newest"
}
```

### Validation (status 400 unless noted)

* Name required, 2–255 chars (contacts: name ≤ 255)
* E-mail must be well-formed when present (optional on contacts)
* Password 8–128 chars; register e-mail must be unique (409)
* Phone required, 7–20 chars, `^\+?[1-9]\d{6,19}$`; globally unique (409 on conflict)
* Category must be `WORK`, `FAMILY`, or `FRIEND` (defaults to `FRIEND`)
* Duplicate contact e-mail → 409

---

## 🗄️ Database Model

PostgreSQL database `phonebook`. The backend maps the existing tables 1:1 and never alters them (no migrations run at startup).

| PostgreSQL Table | C# Model | Primary Key | Relationships |
|---|---|---|---|
| `users` | `User` | `id` (identity) | one-to-many → contacts |
| `contacts` | `Contact` | `id` (identity) | many-to-one → users via `user_id` (nullable) |

`users`: `id`, `name`, `email` (unique), `password_hash` (nullable, Argon2id), `google_id` (nullable, unique), `created_at` (timestamptz).

`contacts`: `id`, `user_id` (nullable FK → `users.id`), `name`, `phone_number` (unique), `email` (nullable, unique), `address` (text, nullable), `category`, `created_at` (timestamptz).

> ⚠️ Never run destructive commands against the database (`DROP`, `TRUNCATE`, `DELETE FROM`, `docker compose down -v`). The volume `postgres_data` holds all data.

---

## 🐳 Running with Docker

From the project root:

```bash
docker compose up -d --build
docker compose ps
docker logs -f phonebook-dotnet-backend
```

| Container | Port | Purpose |
|---|---|---|
| `phonebook-postgres` | `5432` | PostgreSQL 16 (`phonebook` db) |
| `phonebook-dotnet-backend` | internal `8000` | ASP.NET Core API (via `:80` only) |
| `phonebook-frontend` | `80` | Vue SPA + `/api/*` reverse proxy |

Application: `http://localhost:80` (login with `testuser@example.com` / `Test@12345`).

### Other commands

```bash
docker compose build          # rebuild images
docker compose up -d          # start
docker compose ps             # status
docker compose stop           # stop (keeps data)
docker compose restart        # restart
docker network ls             # networks (app uses <project>_default)
docker logs phonebook-dotnet-backend
docker logs phonebook-frontend
docker logs phonebook-postgres
```

### Swagger

The API serves Swagger internally. To browse it, forward the backend port temporarily:

```bash
docker run --rm --network phonebook-app-java-main_default \
  -p 127.0.0.1:18080:8000 phonebook-app-java-main-backend
# then open http://localhost:18080/swagger (JWT via Authorize button)
```

---

## 💻 Running the Backend Locally

Requires the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0):

```bash
cd backend-dotnet
dotnet restore
dotnet build
dotnet run   # listens on http://localhost:8000 (ASPNETCORE_URLS)
```

Point it at a database with:

```bash
ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=phonebook;Username=postgres;Password=postgres"
```

(`appsettings.Development.json` already defaults to this.)

## 🎨 Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173 — /api proxied to http://localhost:80
```

The Docker stack must be up so the dev proxy has an API to call.

---

## 🧪 Testing

### Backend (API compatibility battery)

Exercise every endpoint against a running stack:

```bash
BASE=http://localhost:80 ./scripts/api-battery.sh   # 42 checks
```

### Frontend

```bash
cd frontend
npm test        # Vitest suite
npm run build   # production build
```

### CI

`.github/workflows/ci.yml` builds the .NET backend and runs the frontend tests + build.

---

## 🔐 Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | Npgsql connection string | `Host=postgres;Port=5432;Database=phonebook;Username=postgres;Password=postgres` |
| `Jwt__Key` | HMAC signing secret (≥32 chars; HS512 ≥64 B, HS384 ≥48 B) | built-in dev default (override in production!) |
| `Jwt__ExpiryMinutes` | Token lifetime | `60` |
| `JWT_SECRET` | Alias for `Jwt__Key` (previous backend's name) | — |
| `JWT_EXPIRATION_MINUTES` | Alias for `Jwt__ExpiryMinutes` | — |
| `ASPNETCORE_URLS` | Listen address in the image | `http://+:8000` |

Do not commit real secrets or `.env` files.

---

## 🔁 Backend Notes (Java → .NET)

* Same routes, query params, JSON names, and status codes; old JWTs still validate (same secret + key-length-based algorithm).
* Passwords use the same Argon2id parameters, so existing hashes verify unchanged.
* Error bodies now always include the reason in `detail`/`message` (previously empty); duplicate phone/e-mail returns `409` instead of `500`.
* Date boundaries are evaluated in UTC (containers run on UTC).
* Startup ensures the schema objects and the documented demo account exist (idempotent; data-preserving) and tops the demo account up to 1000 contacts.

---

## 📌 Future Improvements

* Refresh tokens / interpretable session list
* Rate limiting on auth endpoints
* Production secret management (vault / managed identity)
* Postgres backups + PITR runbook
* Expanded backend integration tests in CI
