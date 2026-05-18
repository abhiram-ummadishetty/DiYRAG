FROM python:3.11-slim

WORKDIR /app

COPY ../backend/ .

RUN pip install uv && \
    uv pip install --system -r pyproject.toml

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]