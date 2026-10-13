#!/bin/bash
set -e
bash /app/scripts/migrate.sh
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
