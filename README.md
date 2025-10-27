# robot-demo

A full-stack application with React-Vite frontend (using Tailwind CSS) and FastAPI backend.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server

## Project Structure

```
robot-demo/
├── frontend/          # React-Vite frontend
│   ├── src/
│   ├── package.json
│   └── tailwind.config.js
└── backend/           # FastAPI backend
    ├── main.py
    └── requirements.txt
```

## Setup Instructions

### Quick Start (Recommended)

Run both servers with a single command:
```bash
./start.sh
```

This will start both the backend (port 8000) and frontend (port 5173) servers.

### Manual Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`
- Robots endpoint: `http://localhost:8000/api/robots`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Development

### Backend Development
- The FastAPI backend includes CORS middleware configured for local development
- Endpoints are defined in `backend/main.py`
- The server auto-reloads on code changes when running with `--reload`

### Frontend Development
- React components are in `frontend/src/`
- Tailwind CSS is configured in `frontend/tailwind.config.js`
- The dev server includes hot module replacement (HMR)

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint
- `GET /api/robots` - Get list of robots
- `POST /api/robots` - Create a new robot

## Features

- ✅ React 18 with TypeScript
- ✅ Vite for fast development and builds
- ✅ Tailwind CSS for styling
- ✅ FastAPI backend with async support
- ✅ CORS enabled for local development
- ✅ Responsive UI design
- ✅ API integration between frontend and backend
