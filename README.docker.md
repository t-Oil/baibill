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
   ```

4. **Build and start the services**:
   ```bash
   docker-compose up -d
   ```

5. **Check the status**:
   ```bash
   docker-compose ps
   ```

6. **Access the application**:
   - Frontend: http://localhost
   - API: http://localhost/api
   - API Documentation: http://localhost/api/docs (development only)

7. **Run database migrations**:
   ```bash
   docker-compose exec api npm run migration:run
   ```

8. **Seed initial data** (optional):
   ```bash
   docker-compose exec api npm run seed
   ```

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

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_NAME` | PostgreSQL database name | `receipt_ocr_db` |
| `DATABASE_USER` | PostgreSQL username | `receipt_ocr_user` |
| `DATABASE_PASSWORD` | PostgreSQL password (change this!) | Strong password |
| `JWT_ACCESS_SECRET` | JWT access token secret | 64+ char random string |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | 64+ char random string |
| `DATABASE_SYNC` | Auto-sync DB schema (false in prod) | `false` |
| `NEXT_PUBLIC_API_URL` | Public API URL | `http://localhost/api` |

### Docker Compose Ports

By default, Nginx exposes:
- Port 80 (HTTP)
- Port 443 (HTTPS - when configured)

To change ports, edit `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Change left side only
    - "8443:443"
```

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

**Create a new migration**:
```bash
docker-compose exec api npm run migration:generate -- src/migrations/MigrationName
```

**Run migrations**:
```bash
docker-compose exec api npm run migration:run
```

**Revert last migration**:
```bash
docker-compose exec api npm run migration:revert
```

**Show migration status**:
```bash
docker-compose exec api npm run migration:show
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
curl http://localhost/health

# API
curl http://localhost/api/health

# Frontend
curl http://localhost
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

- [ ] Change all default passwords and secrets in `.env`
- [ ] Set `DATABASE_SYNC=false` (use migrations)
- [ ] Configure SSL certificates
- [ ] Enable HTTPS redirect in Nginx
- [ ] Update `APP_URL` and `NEXT_PUBLIC_API_URL` to production domain
- [ ] Review and adjust Nginx rate limiting
- [ ] Set up automated PostgreSQL backups
- [ ] Configure log rotation
- [ ] Set up monitoring (Prometheus, Grafana, etc.)
- [ ] Configure firewall rules
- [ ] Set up reverse proxy if using cloud load balancer
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
