from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Robot Demo API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    message: str


@app.get("/")
async def root():
    return {"message": "Welcome to Robot Demo API"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "robot-demo-api"}


@app.get("/api/robots")
async def get_robots():
    return {
        "robots": [
            {"id": 1, "name": "R2-D2", "type": "Astromech", "status": "active"},
            {"id": 2, "name": "C-3PO", "type": "Protocol", "status": "active"},
            {"id": 3, "name": "Wall-E", "type": "Waste Allocation", "status": "active"},
        ]
    }


@app.post("/api/robots")
async def create_robot(robot: dict):
    return {"message": "Robot created", "robot": robot}
