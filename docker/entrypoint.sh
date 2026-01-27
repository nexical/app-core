#!/bin/sh
# docker/entrypoint.sh

set -e

# Default values if connection string parsing fails or env not set
DB_HOST="postgres"
DB_PORT="5432"
DB_USER="my-app"

# Try to parse DATABASE_URL if present for better defaults
if [ -n "$DATABASE_URL" ]; then
  # Simple parser assuming format postgresql://user:pass@host:port/db
  # Removes schema
  TEMP="${DATABASE_URL#*://}"
  # Extract user (before :)
  DB_USER="${TEMP%%:*}"
  # Remove user:pass@
  TEMP="${TEMP#*@}"
  # Extract host (before :)
  DB_HOST="${TEMP%%:*}"
  # Remove host
  TEMP="${TEMP#*:}"
  # Extract port (before /)
  DB_PORT="${TEMP%%/*}"
fi

echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."

# Loop until pg_isready returns 0
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "Database unavailable - sleeping..."
  sleep 2
done

echo "Database is ready!"

echo "Running migrations..."
if [ "$PRISMA_FORCE_PUSH" = "true" ]; then
  echo "Environment flag set: executing prisma db push..."
  npx prisma db push --accept-data-loss
else
  npx prisma migrate deploy
fi

if [ "$SKIP_SEED" = "true" ]; then
  echo "Skipping database seed (SKIP_SEED=true)..."
else
  echo "Seeding database..."
  npx prisma db seed
fi

echo "Starting application..."
exec "$@"
