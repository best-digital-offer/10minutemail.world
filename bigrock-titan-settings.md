# BigRock Titan Email IMAP Settings

## IMAP Settings:
- **Server:** `imap.titan.email`
- **Port:** `993` (SSL) or `143` (STARTTLS)
- **Security:** SSL/TLS
- **Username:** Your full email address
- **Password:** Your email password

## SMTP Settings:
- **Server:** `smtp.titan.email`
- **Port:** `587` (STARTTLS) or `465` (SSL)
- **Security:** STARTTLS or SSL/TLS
- **Username:** Your full email address
- **Password:** Your email password

## Where to Find Settings:

1. **BigRock Control Panel:**
   - Login → Email Management → Email Accounts
   - Click "Configure Email Client"

2. **Titan Email Panel:**
   - Login at: https://titan.email
   - Settings → Email Client Setup

3. **Alternative Servers:**
   - `mail.yourdomain.com:993` (if configured)
   - `yourdomain.com:993` (sometimes works)

## Test Connection:
```bash
telnet imap.titan.email 993
```