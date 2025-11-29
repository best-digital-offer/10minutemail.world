# Setup Email Forwarding with Your Website

## Option 1: cPanel Email Forwarder (Easiest)

1. **Login to cPanel**
2. **Go to Email Forwarders**
3. **Create forwarder:**
   - From: `*@10minutemail.world` (catch-all)
   - To: `email-forwarder.php` (pipe to script)

## Option 2: Email Pipe Script

Create `.forward` file in your home directory:
```
"|/path/to/your/website/email-pipe.php"
```

## Option 3: Manual Email Check (IMAP)

Update `email-api.php`:
```php
// Add IMAP checking
$inbox = imap_open('{mail.yourdomain.com:993/imap/ssl}INBOX', 'user@yourdomain.com', 'password');
$emails = imap_search($inbox, 'UNSEEN');
// Process emails...
```

## Option 4: Simple Contact Form Forward

Create a contact form that forwards to temp emails:
```php
// When someone sends to temp email, forward via your contact form
mail($temp_email_user, $subject, $message, "From: $sender");
```

Which option works best for your hosting setup?