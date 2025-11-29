<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$emailsDir = __DIR__ . '/temp_emails/';
if (!is_dir($emailsDir)) mkdir($emailsDir, 0755, true);

// BigRock IMAP settings
$imap_server = '{imap.titan.email:993/imap/ssl}INBOX';
$email = 'process@10minutemailguide.world'; // Your actual email
$password = 'YOUR_PASSWORD'; // Change this

function checkIMAPEmails() {
    global $imap_server, $email, $password, $emailsDir;
    
    $imap = @imap_open($imap_server, $email, $password);
    if (!$imap) return;
    
    $emails = imap_search($imap, 'UNSEEN');
    if ($emails) {
        foreach ($emails as $email_id) {
            $header = imap_headerinfo($imap, $email_id);
            $body = imap_body($imap, $email_id);
            
            $to_email = $header->to[0]->mailbox . '@' . $header->to[0]->host;
            
            $emailData = [
                'id' => uniqid(),
                'to' => $to_email,
                'from' => $header->from[0]->mailbox . '@' . $header->from[0]->host,
                'subject' => $header->subject ?? 'No Subject',
                'body' => $body,
                'timestamp' => date('c')
            ];
            
            // Store email
            $file = $emailsDir . md5($to_email) . '.json';
            $stored_emails = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
            array_unshift($stored_emails, $emailData);
            $stored_emails = array_slice($stored_emails, 0, 10);
            file_put_contents($file, json_encode($stored_emails));
            
            imap_setflag_full($imap, $email_id, "\\Seen");
        }
    }
    imap_close($imap);
}

// Check IMAP when getting emails
if ($_GET['email']) {
    checkIMAPEmails();
    
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