# Gmail Setup for Temporary Email

## Step 1: Enable 2FA & App Password
1. Go to Google Account settings
2. Security → 2-Step Verification → Turn On
3. App passwords → Generate password for "Mail"
4. Copy the 16-character password

## Step 2: Gmail Forwarding (Option A)
1. Gmail Settings → Forwarding and POP/IMAP
2. Add forwarding address: `your-website-email@domain.com`
3. Create filter: emails to `*@10minutemailguide.world` → Forward

## Step 3: Domain MX Records (Option B)
1. Point MX record: `10minutemailguide.world` → Gmail servers
2. Add domain in Google Workspace (paid)

## Step 4: Update Code
```php
$gmail = 'your-gmail@gmail.com';
$app_password = 'abcd efgh ijkl mnop'; // 16-char app password
```

## Step 5: Test
- Send email to any `test@10minutemailguide.world`
- Should appear in your temp email inbox

**Easiest:** Use Gmail forwarding with filters!