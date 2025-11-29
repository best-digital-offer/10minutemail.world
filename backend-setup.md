# Backend Setup for Real Email Functionality

## Overview
This document explains how to set up a backend to receive real emails for your temporary email service.

## Option 1: Using Mailgun (Recommended)

### 1. Setup Mailgun Account
1. Sign up at https://mailgun.com
2. Verify your domain or use Mailgun's sandbox domain
3. Get your API key from the dashboard

### 2. Configure Webhook
Set up a webhook in Mailgun to forward emails to your server:
```
Webhook URL: https://yourdomain.com/api/mailgun-webhook
Events: delivered, opened, clicked
```

### 3. Backend API Implementation (Node.js/Express)
```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

// Store emails in memory (use database in production)
const emailStorage = new Map();

// Mailgun webhook verification
function verifyWebhook(timestamp, token, signature, signingKey) {
    const value = timestamp + token;
    const hash = crypto.createHmac('sha256', signingKey).update(value).digest('hex');
    return hash === signature;
}

// Webhook endpoint for receiving emails
app.post('/api/mailgun-webhook', express.raw({type: 'application/x-www-form-urlencoded'}), (req, res) => {
    const data = new URLSearchParams(req.body.toString());
    
    // Verify webhook (optional but recommended)
    const timestamp = data.get('timestamp');
    const token = data.get('token');
    const signature = data.get('signature');
    
    if (!verifyWebhook(timestamp, token, signature, process.env.MAILGUN_SIGNING_KEY)) {
        return res.status(401).send('Unauthorized');
    }
    
    // Extract email data
    const email = {
        id: Date.now() + Math.random(),
        to: data.get('recipient'),
        from: data.get('sender'),
        subject: data.get('subject'),
        body: data.get('body-plain') || data.get('body-html'),
        timestamp: new Date().toISOString()
    };
    
    // Store email
    if (!emailStorage.has(email.to)) {
        emailStorage.set(email.to, []);
    }
    emailStorage.get(email.to).push(email);
    
    // Clean up old emails (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    emailStorage.forEach((emails, address) => {
        emailStorage.set(address, emails.filter(e => 
            new Date(e.timestamp).getTime() > oneHourAgo
        ));
    });
    
    res.status(200).send('OK');
});

// API endpoint to get emails for an address
app.get('/api/emails/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    const emails = emailStorage.get(email) || [];
    
    res.json({
        emails: emails,
        count: emails.length
    });
});

app.listen(3000, () => {
    console.log('Email backend running on port 3000');
});
```

## Option 2: Using SendGrid

### 1. Setup SendGrid Account
1. Sign up at https://sendgrid.com
2. Create an API key
3. Set up Inbound Parse webhook

### 2. Configure Inbound Parse
```
Hostname: mail.yourdomain.com
URL: https://yourdomain.com/api/sendgrid-webhook
```

### 3. Backend Implementation
```javascript
app.post('/api/sendgrid-webhook', express.json(), (req, res) => {
    const email = {
        id: Date.now() + Math.random(),
        to: req.body.to,
        from: req.body.from,
        subject: req.body.subject,
        body: req.body.text || req.body.html,
        timestamp: new Date().toISOString()
    };
    
    // Store email logic here
    // ... same as Mailgun example
    
    res.status(200).send('OK');
});
```

## Option 3: Custom IMAP/POP3 Server

### 1. Setup Email Server
Use services like:
- AWS SES
- Google Workspace
- Microsoft 365
- Self-hosted mail server

### 2. IMAP Polling Implementation
```javascript
const Imap = require('imap');

function checkEmails() {
    const imap = new Imap({
        user: 'your-email@domain.com',
        password: 'your-password',
        host: 'imap.domain.com',
        port: 993,
        tls: true
    });
    
    imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
            if (err) throw err;
            
            imap.search(['UNSEEN'], (err, results) => {
                if (err) throw err;
                
                if (results.length > 0) {
                    const fetch = imap.fetch(results, { bodies: '' });
                    
                    fetch.on('message', (msg) => {
                        // Process email message
                        // Store in emailStorage
                    });
                }
            });
        });
    });
    
    imap.connect();
}

// Check for emails every 30 seconds
setInterval(checkEmails, 30000);
```

## Frontend Configuration

Update the API endpoint in your JavaScript:
```javascript
// In app.js, update the fetch URL
const response = await fetch(`https://yourdomain.com/api/emails/${encodeURIComponent(this.currentEmail)}`);
```

## Environment Variables

Create a `.env` file:
```
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
MAILGUN_SIGNING_KEY=your_signing_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS for webhooks
2. **Webhook Verification**: Verify webhook signatures
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **Data Cleanup**: Automatically delete old emails
5. **CORS**: Configure CORS properly for your domain

## Testing

1. Deploy your backend
2. Configure webhook URLs
3. Send test emails to generated addresses
4. Check if emails appear in the frontend

## Production Deployment

1. Use a production database (PostgreSQL, MongoDB)
2. Implement proper logging
3. Set up monitoring and alerts
4. Use a process manager (PM2, Docker)
5. Configure load balancing if needed

## Troubleshooting

- Check webhook logs in Mailgun/SendGrid dashboard
- Verify webhook URL is accessible
- Test API endpoints manually
- Check CORS configuration
- Monitor server logs for errors