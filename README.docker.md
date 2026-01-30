# Docker Deployment Guide

This guide explains how to run the Receipt OCR application using Docker Compose with production-ready configurations including PostgreSQL, Nginx reverse proxy, and comprehensive security measures.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Security Features](#security-features)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Database Management](#database-management)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB of available RAM
- 10GB of free disk space

## Quick Start

1. **Clone the repository** (if not already done):

   ```bash
   cd /path/to/receipt-ocr
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.docker.example .env
   ```

3. **Edit `.env` file** and update the following **critical** values:

   ```bash
   # Generate secure secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   # Update these in .env:
   DATABASE_PASSWORD=<your-secure-password>
   JWT_ACCESS_SECRET=<generated-secret>
   JWT_REFRESH_SECRET=<generated-secret>

   # Add your OpenAI API key for OCR functionality
   OPENAI_API_KEY=sk-proj-your_actual_key_here
   OPENAI_MODEL=gpt-4o

   # (Optional) Email configuration for user invitations
   MAILJET_API_KEY=your_mailjet_key
   MAILJET_API_SECRET=your_mailjet_secret
   MAIL_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Build and start the services**:

   ```bash
   docker compose up -d
   ```

5. **Wait for initialization** (migrations run automatically):

   The application will automatically run database migrations on first startup. Wait about 30 seconds for all services to be healthy.

6. **Check the status**:

   ```bash
   docker compose ps
   ```

   All services should show "healthy" status.

7. **Seed initial data** (required for first-time setup):

   ```bash
   # Create initial admin user and role
   docker exec -i receipt-ocr-postgres psql -U receipt_ocr_user -d receipt_ocr_db <<'EOSQL'
   BEGIN;
   INSERT INTO users (uid, email, password, first_name, last_name, is_active)
   VALUES (
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'admin@example.com',
     '\$2b\$10\$q0hjOtRsBW0U9m4qZVPbduqEYlBLjl22DoHRWHu.csh/WmlMU109a',
     'Admin',
     'User',
     '1'
   );
   INSERT INTO roles (uid, name, created_by, is_default)
   VALUES (
     'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
     'admin',
     1,
     true
   );
   INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
   COMMIT;
   EOSQL

   # Run the full seeder
   docker exec receipt-ocr-api node dist/db/seeds/run-seed.js
   ```

8. **Access the application**:
   - **Frontend**: http://localhost:8181
   - **API**: http://localhost:8181/api
   - **Health Check**: http://localhost:8181/api/health/check

9. **Login credentials**:
   - Email: `admin@example.com`
   - Password: `password123`

   **⚠️ Important**: Change the admin password immediately after first login!

## Architecture

The Docker setup consists of four services:

```
┌─────────────────────────────────────────────────────┐
│                     Nginx (Port 80/443)              │
│              Reverse Proxy + Load Balancer          │
│         (Security Headers, Rate Limiting, SSL)      │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼─────────┐  ┌───────▼─────────┐
│   Frontend      │  │   API (NestJS)   │
│   (Next.js)     │  │   Port 4000      │
│   Port 3000     │  │                  │
└─────────────────┘  └────────┬─────────┘
                              │
                     ┌────────▼──────────┐
                     │   PostgreSQL      │
                     │   Port 5432       │
                     │   (Internal only) │
                     └───────────────────┘
```

### Service Details

- **Nginx**: Reverse proxy with security headers, rate limiting, and SSL support
- **Frontend**: Next.js application in standalone mode
- **API**: NestJS backend with TypeORM
- **PostgreSQL**: Database with persistent volume

## Configuration

### Environment Variables

All configuration is done through the `.env` file. Key variables:

| Variable                       | Description                                | Example                             |
| ------------------------------ | ------------------------------------------ | ----------------------------------- |
| `DATABASE_NAME`                | PostgreSQL database name                   | `receipt_ocr_db`                    |
| `DATABASE_USER`                | PostgreSQL username                        | `receipt_ocr_user`                  |
| `DATABASE_PASSWORD`            | PostgreSQL password (change this!)         | Strong password                     |
| `JWT_ACCESS_SECRET`            | JWT access token secret                    | 64+ char random string              |
| `JWT_REFRESH_SECRET`           | JWT refresh token secret                   | 64+ char random string              |
| `DATABASE_SYNC`                | Auto-sync DB schema (false in prod)        | `false`                             |
| `NEXT_PUBLIC_API_URL`          | Public API URL                             | `http://localhost:8181/api`         |
| `OPENAI_ENABLED`               | Enable OpenAI OCR                          | `true`                              |
| `OPENAI_API_KEY`               | OpenAI API key for OCR                     | `sk-proj-...`                       |
| `OPENAI_MODEL`                 | OpenAI model to use                        | `gpt-4o`                            |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP credentials (alternative)    | `/app/secrets/gcp-vision.json`      |
| `MAILJET_API_KEY`              | Mailjet API key for emails                 | Get from mailjet.com                |
| `MAILJET_API_SECRET`           | Mailjet API secret                         | Get from mailjet.com                |
| `MAIL_FROM_EMAIL`              | Email sender address                       | `noreply@yourdomain.com`            |

### Automatic Migrations

**Database migrations run automatically** when the API container starts (controlled by `DB_AUTO_MIGRATE=true` in docker-compose.yml). On first startup, all 19 migration files will execute automatically, creating:

- 16 database tables
- Indexes and constraints
- Foreign key relationships

You can verify migrations ran successfully:

```bash
docker exec receipt-ocr-postgres psql -U receipt_ocr_user -d receipt_ocr_db -c "\dt"
```

### Docker Compose Ports

By default, Nginx exposes:

- Port 8181 (HTTP)
- Port 8443 (HTTPS - when configured)

To change ports, edit `docker-compose.yml`:

```yaml
nginx:
  ports:
    - '8080:80'  # Change left side only (e.g., 8080:80 for port 8080)
    - '8443:443' # HTTPS port
```

**⚠️ Note**: If you change the port, also update `.env`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT/api
```

### OCR Provider Configuration

The application supports two OCR providers:

#### Option 1: OpenAI (Recommended - Easier Setup)

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Update `.env`:
   ```bash
   OPENAI_ENABLED=true
   OPENAI_API_KEY=sk-proj-your_key_here
   OPENAI_MODEL=gpt-4o
   OPENAI_TEMPERATURE=0
   ```
3. Restart containers: `docker compose restart api`

**Models**:
- `gpt-4o` - Best accuracy, recommended
- `gpt-4o-mini` - Faster, cheaper, good accuracy
- `gpt-4-turbo` - Alternative

#### Option 2: Google Cloud Vision

1. Create a GCP project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable Vision API
3. Create service account and download JSON credentials
4. Save credentials as `apps/api/secrets/gcp-vision.json`
5. Update `.env`:
   ```bash
   OPENAI_ENABLED=false
   GOOGLE_APPLICATION_CREDENTIALS=/app/secrets/gcp-vision.json
   ```
6. Restart: `docker compose restart api`

The credentials are automatically mounted as a read-only volume. See `apps/api/secrets/README.md` for detailed setup instructions.

### Email Configuration (Optional)

For user invitation emails:

1. Sign up at [Mailjet](https://app.mailjet.com)
2. Get API credentials
3. Update `.env`:
   ```bash
   MAILJET_API_KEY=your_key
   MAILJET_API_SECRET=your_secret
   MAIL_FROM_EMAIL=noreply@yourdomain.com
   ```
4. Restart: `docker compose restart api`

## Security Features

### Container Security

✅ **Non-root users**: All containers run as non-root users
✅ **Read-only filesystems**: Containers have read-only root filesystems
✅ **Dropped capabilities**: Minimal Linux capabilities
✅ **No new privileges**: Prevents privilege escalation
✅ **Resource limits**: CPU and memory limits (can be configured)
✅ **Health checks**: Automatic container health monitoring

### Network Security

✅ **Isolated network**: Services communicate on a dedicated bridge network
✅ **No exposed database**: PostgreSQL is not accessible from outside
✅ **Rate limiting**: API and frontend requests are rate-limited
✅ **Security headers**: X-Frame-Options, CSP, XSS protection, etc.

### Application Security

✅ **JWT authentication**: Secure token-based authentication
✅ **CORS configuration**: Restricted cross-origin requests
✅ **Input validation**: Request validation with class-validator
✅ **SQL injection protection**: TypeORM parameterized queries
✅ **Secrets management**: Environment variables for sensitive data

## SSL/HTTPS Setup

For production deployment, enable HTTPS:

### Option 1: Let's Encrypt (Recommended for production)

1. **Install Certbot**:

   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. **Stop Docker containers**:

   ```bash
   docker-compose down
   ```

3. **Generate certificates**:

   ```bash
   sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
   ```

4. **Copy certificates**:

   ```bash
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
   sudo chmod 644 nginx/ssl/fullchain.pem
   sudo chmod 600 nginx/ssl/privkey.pem
   ```

5. **Enable HTTPS in Nginx**:
   Edit `nginx/conf.d/default.conf` and uncomment the HTTPS server block.

6. **Update environment variables**:

   ```bash
   # In .env file
   APP_URL=https://your-domain.com
   NEXT_PUBLIC_API_URL=https://your-domain.com/api
   ```

7. **Restart containers**:
   ```bash
   docker-compose up -d
   ```

### Option 2: Self-Signed Certificate (Development only)

```bash
cd nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

Then follow steps 5-7 above.

## Database Management

### Backups

**Create a backup**:

```bash
docker-compose exec postgres pg_dump -U receipt_ocr_user receipt_ocr_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore from backup**:

```bash
docker-compose exec -T postgres psql -U receipt_ocr_user receipt_ocr_db < backup_20250127_120000.sql
```

### Migrations

**⚠️ Note**: Migrations run **automatically** on container startup (controlled by `DB_AUTO_MIGRATE=true`). Manual commands below are only needed for development.

**Show migration status**:

```bash
docker exec receipt-ocr-api node -e "console.log('Migrations run automatically on startup')"
docker exec receipt-ocr-postgres psql -U receipt_ocr_user -d receipt_ocr_db -c "SELECT * FROM migrations;"
```

**For local development** (not needed in Docker):

```bash
# Create a new migration
docker compose exec api npm run migration:generate -- src/migrations/MigrationName

# Run migrations manually (if auto-migration is disabled)
docker compose exec api npm run migration:run

# Revert last migration
docker compose exec api npm run migration:revert

# Show migration status
docker compose exec api npm run migration:show
```

### Direct Database Access

```bash
docker-compose exec postgres psql -U receipt_ocr_user -d receipt_ocr_db
```

## Monitoring and Logs

### View Logs

**All services**:

```bash
docker-compose logs -f
```

**Specific service**:

```bash
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f nginx
docker-compose logs -f postgres
```

**Last 100 lines**:

```bash
docker-compose logs --tail=100 api
```

### Health Checks

**Check service health**:

```bash
docker-compose ps
```

All services should show "healthy" status.

**Manual health checks**:

```bash
# Nginx
curl http://localhost:8181/health

# API
curl http://localhost:8181/api/health/check

# Frontend
curl http://localhost:8181
```

### Resource Usage

```bash
docker stats
```

## Troubleshooting

### Container Won't Start

1. **Check logs**:

   ```bash
   docker-compose logs <service-name>
   ```

2. **Check for port conflicts**:

   ```bash
   sudo lsof -i :80
   sudo lsof -i :443
   ```

3. **Verify environment variables**:
   ```bash
   docker-compose config
   ```

### Database Connection Issues

1. **Verify PostgreSQL is running**:

   ```bash
   docker-compose ps postgres
   ```

2. **Test database connection**:

   ```bash
   docker-compose exec postgres pg_isready -U receipt_ocr_user
   ```

3. **Check database logs**:
   ```bash
   docker-compose logs postgres
   ```

### API Returns 502 Bad Gateway

1. **Check API container health**:

   ```bash
   docker-compose ps api
   docker-compose logs api
   ```

2. **Verify API is responding**:

   ```bash
   docker-compose exec api wget -O- http://localhost:4000/api/health
   ```

3. **Check Nginx upstream configuration**:
   ```bash
   docker-compose exec nginx cat /etc/nginx/nginx.conf | grep upstream
   ```

### Permission Issues

If you encounter permission issues with volumes:

```bash
# Fix volume permissions
docker-compose down
sudo chown -R 1001:1001 postgres_data/
docker-compose up -d
```

### Reset Everything

**Warning**: This will delete all data!

```bash
docker-compose down -v
docker-compose up -d
```

## Production Deployment

### Pre-Deployment Checklist

**Security & Configuration:**
- [ ] Change all default passwords and secrets in `.env`
- [ ] Generate new JWT secrets (64+ characters)
- [ ] Change admin password from default (`password123`)
- [ ] Set `DATABASE_SYNC=false` (migrations run automatically)
- [ ] Configure SSL certificates
- [ ] Enable HTTPS redirect in Nginx

**OCR & Services:**
- [ ] Add OpenAI API key OR configure Google Cloud Vision
- [ ] Test OCR functionality with sample receipts
- [ ] Configure email provider (Mailjet) for user invitations
- [ ] Test email delivery

**Infrastructure:**
- [ ] Update `APP_URL` and `NEXT_PUBLIC_API_URL` to production domain
- [ ] Review and adjust Nginx rate limiting
- [ ] Set up automated PostgreSQL backups
- [ ] Configure log rotation
- [ ] Set up monitoring (Prometheus, Grafana, etc.)
- [ ] Configure firewall rules (close unnecessary ports)
- [ ] Set up reverse proxy if using cloud load balancer
- [ ] Configure custom ports if port 80/443 are unavailable

**Testing:**
- [ ] Verify all 16 database tables created
- [ ] Run seeders to populate initial data
- [ ] Test user registration and login
- [ ] Test receipt upload and OCR extraction
- [ ] Test organization management features
- [ ] Test all functionality in staging environment
- [ ] Plan rollback strategy

### Resource Limits

For production, add resource limits in `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Automated Backups

Create a cron job for automated backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/receipt-ocr && docker-compose exec -T postgres pg_dump -U receipt_ocr_user receipt_ocr_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Keep only last 30 days
0 3 * * * find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

### Update Strategy

To update the application:

```bash
# Pull latest changes
git pull

# Rebuild containers
docker-compose build --no-cache

# Stop old containers
docker-compose down

# Start new containers
docker-compose up -d

# Run migrations
docker-compose exec api npm run migration:run

# Verify health
docker-compose ps
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Security Best Practices](https://nginx.org/en/docs/http/ngx_http_core_module.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Review this documentation
3. Check Docker and application health
4. Search existing issues in the repository

---

**Important Security Note**: Never commit your `.env` file or SSL certificates to version control. Keep them secure and rotate secrets regularly.
