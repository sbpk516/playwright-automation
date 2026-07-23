# StreamForge

StreamForge is a fictional streaming application built with Next.js, FastAPI, and SQLite. It includes catalog discovery, watchlists, profiles with maturity limits, simulated subscription changes, local playback, and catalog administration.

## Start with Docker

```bash
docker compose up --build
```

Open `http://localhost:3000`.

## Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Subscriber | `river@streamforge.test` | `stream123` |
| Subscriber | `sage@streamforge.test` | `stream123` |
| Administrator | `admin@streamforge.test` | `admin123` |

All accounts, titles, prices, and assets are fictional.

## Run Without Docker

```bash
python -m venv .venv
.venv/Scripts/pip install ./apps/api
.venv/Scripts/uvicorn app.main:app --app-dir apps/api --reload
npm install
npm run dev
```

The web application runs on `http://localhost:3000`; the API and OpenAPI documentation run on `http://localhost:8000` and `http://localhost:8000/docs`.

## Product Documentation

- [Requirements](streamforge-requirements.md)
- [System design](system-design.md)
- [Technology stack](tech-stack.md)
- [Architecture decisions](adr-index.md)
- [Epics](epics-index.md)
