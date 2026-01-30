#!/bin/sh
# Docker entrypoint script for NestJS API
# This script runs database migrations before starting the application

set -e

echo "🔍 Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be ready
until wget --quiet --tries=1 --spider "http://${DB_HOST:-postgres}:${DB_PORT:-5432}" 2>/dev/null || \
      PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST:-postgres}" -U "${DB_USERNAME}" -d "${DB_NAME}" -c '\q' 2>/dev/null; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run migrations if DB_AUTO_MIGRATE is true (default behavior)
if [ "${DB_AUTO_MIGRATE:-true}" = "true" ]; then
  echo "🔄 Running database migrations..."
  npm run migration:run || {
    echo "❌ Migration failed!"
    exit 1
  }
  echo "✅ Migrations completed successfully!"
else
  echo "⏭️  Skipping migrations (DB_AUTO_MIGRATE=false)"
fi

echo "🚀 Starting application..."

# Execute the main command (node dist/main.js)
exec "$@"
