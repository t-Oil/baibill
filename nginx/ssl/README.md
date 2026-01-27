# SSL Certificates

Place your SSL certificates in this directory for HTTPS configuration.

## Files Required

- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

## Using Let's Encrypt with Certbot

To generate free SSL certificates using Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to this directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./fullchain.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./privkey.pem
sudo chmod 644 ./fullchain.pem
sudo chmod 600 ./privkey.pem
```

## Self-Signed Certificates (Development Only)

For development, you can generate self-signed certificates:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./privkey.pem \
  -out ./fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Important Notes

- Never commit real SSL certificates to version control
- Keep private keys secure with restricted permissions (600)
- Renew Let's Encrypt certificates before they expire (every 90 days)
- After placing certificates, uncomment the HTTPS server block in `nginx/conf.d/default.conf`
