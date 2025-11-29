# BigRock Email Setup for Temporary Email

## Method 1: Email Forwarder (Recommended)

1. **Login to BigRock Control Panel**
2. **Go to Email Management > Email Forwarders**
3. **Create Forwarder:**
   - From: `*@10minutemail.world` (catch-all)
   - To: `process@10minutemail.world` (create this email)
4. **Set up Email Account:**
   - Create: `process@10minutemail.world`
   - Password: [secure password]

## Method 2: IMAP Check

Update `email-forwarder.php`:
```php
// Add at top
$imap = imap_open('{mail.10minutemail.world:993/imap/ssl}INBOX', 
    'process@10minutemail.world', 'your_password');

if ($imap) {
    $emails = imap_search($imap, 'UNSEEN');
    if ($emails) {
        foreach ($emails as $email_id) {
            $header = imap_headerinfo($imap, $email_id);
            $body = imap_body($imap, $email_id);
            
            // Store email data
            $emailData = [
                'id' => uniqid(),
                'to' => $header->to[0]->mailbox . '@' . $header->to[0]->host,
                'from' => $header->from[0]->mailbox . '@' . $header->from[0]->host,
                'subject' => $header->subject,
                'body' => $body,
                'timestamp' => date('c')
            ];
            
            // Save to file (existing code)
            // Mark as read
            imap_setflag_full($imap, $email_id, "\\Seen");
        }
    }
    imap_close($imap);
}
```

**Which method do you prefer?**