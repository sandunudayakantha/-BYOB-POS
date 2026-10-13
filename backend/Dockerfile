FROM --platform=linux/amd64 python:3.13-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libpq-dev build-essential curl && rm -rf /var/lib/apt/lists/*
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/production.txt
COPY . .
EXPOSE 8000
RUN chmod +x /app/scripts/entrypoint.sh /app/scripts/migrate.sh
CMD ["/app/scripts/entrypoint.sh"]
