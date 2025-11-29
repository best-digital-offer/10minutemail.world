<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$emailsDir = __DIR__ . '/temp_emails/';
if (!is_dir($emailsDir)) mkdir($emailsDir, 0755, true);

// Gmail IMAP settings
$imap_server = '{imap.gmail.com:993/imap/ssl}INBOX';
$gmail = 'your-gmail@gmail.com';
$app_password = 'YOUR_APP_PASSWORD'; // 16-character app password

function checkGmailEmails() {
    global $imap_server, $gmail, $app_password, $emailsDir;
    
    $imap = @imap_open($imap_server, $gmail, $app_password);
    if (!$imap) return;
    
    // Search for emails with your domain in TO field
    $emails = imap_search($imap, 'TO "10minutemailguide.world" UNSEEN');
    if ($emails) {
        foreach ($emails as $email_id) {
            $header = imap_headerinfo($imap, $email_id);
            $body = imap_body($imap, $email_id);
            
            // Find the temp email address
            $to_email = '';
            foreach ($header->to as $to) {
                if (strpos($to->host, '10minutemailguide.world') !== false) {
                    $to_email = $to->mailbox . '@' . $to->host;
                    break;
                }
            }
            
            if ($to_email) {
                $emailData = [
                    'id' => uniqid(),
                    'to' => $to_email,
                    'from' => $header->from[0]->mailbox . '@' . $header->from[0]->host,
                    'subject' => $header->subject ?? 'No Subject',
                    'body' => $body,
                    'timestamp' => date('c')
                ];
                
                $file = $emailsDir . md5($to_email) . '.json';
                $stored_emails = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
                array_unshift($stored_emails, $emailData);
                file_put_contents($file, json_encode(array_slice($stored_emails, 0, 10)));
                
                imap_setflag_full($imap, $email_id, "\\Seen");
            }
        }
    }
    imap_close($imap);
}

if ($_GET['email']) {
    checkGmailEmails();
    
    $email = $_GET['email'];
    $file = $emailsDir . md5($email) . '.json';
    
    if (file_exists($file)) {
        $emails = json_decode(file_get_contents($file), true) ?: [];
        echo json_encode(['emails' => $emails]);
    } else {
        echo json_encode(['emails' => []]);
    }
}
?>