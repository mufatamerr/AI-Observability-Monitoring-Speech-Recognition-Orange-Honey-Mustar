# Quick Start Guide

## Option 1: Run Locally (Recommended for Development)

### Step 1: Start the Backend

Open a terminal and run:

```bash
# Navigate to backend directory
cd voiceops/voiceops-backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the backend server
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will run on: **http://localhost:8000**

You can test it by visiting:
- http://localhost:8000/health
- http://localhost:8000/docs (API documentation)

### Step 2: Start the Frontend

Open a NEW terminal and run:

```bash
# Navigate to frontend directory
cd voiceops/voiceops-frontend

# Install dependencies (first time only)
npm install

# Start the frontend dev server
npm run dev
```

The frontend will run on: **http://localhost:3000** (or another port if 3000 is busy)

### Step 3: Open in Browser

Visit: **http://localhost:3000**

Click the "Check Backend Health" button to verify everything is connected!

---

## Option 2: Run with Docker (All-in-One)

### Prerequisites
- Docker and Docker Compose installed

### Start Everything

```bash
# From the project root directory
docker compose up -d
```

This starts:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

### Stop Everything

```bash
docker compose down
```

---

## Troubleshooting

### Backend won't start
- Make sure port 8000 is not in use
- Check Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Make sure port 3000 is not in use
- Install dependencies: `npm install`
- Check Node version: `node --version` (need 16+)

### Connection Error
- Make sure backend is running before starting frontend
- Check the API_URL in App.jsx matches your backend URL

