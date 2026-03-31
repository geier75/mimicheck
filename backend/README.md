# 🚀 Nebenkosten-Knacker Backend (Stufe B)

FastAPI-basiertes Backend als BFF/Policy-Layer vor MIMITECH.

## 📋 Voraussetzungen

- **Python:** 3.11 oder höher
- **PostgreSQL:** 15+ (z.B. Neon)
- **Redis:** 7+ (z.B. Upstash)
- **MIMITECH Account** mit App-ID

## 🛠️ Setup

### 1. Virtual Environment erstellen

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# oder: venv\Scripts\activate  # Windows
```

### 2. Dependencies installieren

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

```bash
cp ../.env.example .env
# Werte in .env anpassen
```

**Wichtige Variablen:**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
MIMITECH_APP_ID=your-app-id
MIMITECH_API_KEY=your-api-key
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Datenbank initialisieren

```bash
# Migrationen erstellen (später)
alembic init alembic
alembic revision --autogenerate -m "Initial"
alembic upgrade head
```

## 🚀 Start

### Development Server

```bash
python main.py
# oder
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Mit Docker (später)

```bash
docker-compose up
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Upload
```http
POST /api/upload
Content-Type: multipart/form-data

file: <PDF/Image>
```

### Analyse
```http
POST /api/analyze
Content-Type: application/json

{
  "abrechnung_id": "abr_123"
}
```

### Report
```http
GET /api/report/{abrechnung_id}
```

### Billing
```http
POST /api/billing/checkout
{
  "plan": "basic"
}

GET /api/billing/portal
```

## 🧪 Testing

```bash
# Unit Tests
pytest

# Mit Coverage
pytest --cov=. --cov-report=html

# Nur Integration Tests
pytest tests/integration/
```

## 📊 Monitoring

### Logs
```bash
tail -f logs/app.log
```

### Metrics
- OpenTelemetry → Grafana/Loki
- Health: `http://localhost:8000/health`

## 🔒 Sicherheit

### Secrets Management
- Nutze `.env` lokal
- Production: Vault/AWS Secrets Manager

### Rate Limiting
- 100 Requests/Minute pro IP
- Konfigurierbar via `RATE_LIMIT_*`

### CORS
- Nur erlaubte Origins in `CORS_ORIGINS`

## 📁 Projektstruktur (geplant)

```
backend/
├── main.py               # FastAPI App
├── requirements.txt      # Python Deps
├── .env.example         # Env Template
├── README.md            # Diese Datei
│
├── app/
│   ├── __init__.py
│   ├── api/             # API Routes
│   │   ├── __init__.py
│   │   ├── upload.py
│   │   ├── analyze.py
│   │   ├── billing.py
│   │   └── health.py
│   │
│   ├── core/            # Core Logic
│   │   ├── config.py    # Settings
│   │   ├── security.py  # Auth/JWT
│   │   └── deps.py      # Dependencies
│   │
│   ├── models/          # SQLAlchemy Models
│   │   ├── user.py
│   │   ├── abrechnung.py
│   │   └── analyse.py
│   │
│   ├── schemas/         # Pydantic Schemas
│   │   ├── user.py
│   │   └── abrechnung.py
│   │
│   ├── services/        # Business Logic
│   │   ├── pdf_service.py
│   │   ├── llm_service.py
│   │   ├── storage_service.py
│   │   └── billing_service.py
│   │
│   └── db/              # Database
│       ├── session.py   # DB Session
│       └── base.py      # Base Model
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── alembic/            # DB Migrations
│   └── versions/
│
├── scripts/            # Helper Scripts
│   ├── seed_db.py
│   └── run_worker.py
│
└── docker-compose.yml  # Docker Setup
```

## 🚢 Deployment

### Fly.io / Railway
```bash
fly launch
fly deploy
```

### Docker
```bash
docker build -t nebenkosten-backend .
docker run -p 8000:8000 nebenkosten-backend
```

### Environment
- Development: `API_ENV=development`
- Production: `API_ENV=production`

## 📚 Weitere Docs

- [MIMITECH Integration](./docs/mimitech.md)
- [LLM-Prompts](./docs/llm-prompts.md)
- [Deployment Guide](./docs/deployment.md)

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1"
```

### Redis Connection Error
```bash
# Test Redis
redis-cli -u $REDIS_URL ping
```

### Import Errors
```bash
# Reinstall deps
pip install --force-reinstall -r requirements.txt
```

## 🤝 Contributing

1. Branch erstellen: `git checkout -b feature/xyz`
2. Code schreiben + Tests
3. Lint: `black . && ruff check .`
4. PR erstellen

## 📄 License

Siehe Haupt-README

---

**Status:** 🚧 In Entwicklung (Sprint 3)  
**Maintainer:** Backend Team  
**Docs:** https://docs.staatshilfen.ai
