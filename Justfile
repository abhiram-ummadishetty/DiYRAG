# RAG Pipeline Visualizer
# Usage: just <recipe>


# Install dependencies
setup:
    cd backend && uv sync

# Start the FastAPI backend
backend:
    uv run uvicorn app.main:app --reload --port 8000 --app-dir backend

# Open frontend in VS Code
frontend:
    code frontend/index.html

# Run backend and open frontend
dev:
    @echo "→ Starting backend on http://localhost:8000"
    @echo "→ Open VS Code and click 'Go Live' to start the frontend"
    uv run uvicorn app.main:app --reload --port 8000 --app-dir backend

# Kill port 8000
kill:
    -lsof -ti :8000 | xargs kill -9
    -lsof -ti :5500 | xargs kill -9
    @echo "✓ Port cleared"
