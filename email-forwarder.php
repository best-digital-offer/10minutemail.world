<?php
// Simple email forwarder using your website's mail system
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$emailsDir = __DIR__ . '/temp_emails/';
if (!is_dir($emailsDir)) mkdir($emailsDir, 0755, true);

// Get emails for address
if ($_GET['email']) {
    $email = $_GET['email'];
    $file = $emailsDir . md5($email) . '.json';
    
    if (file_exists($file)) {
        $emails = json_decode(file_get_contents($file), true) ?: [];
        // Clean old emails (>1 hour)
        $emails = array_filter($emails, fn($e) => (time() - strtotime($e['timestamp'])) < 3600);
        file_put_contents($file, json_encode($emails));
        echo json_encode(['emails' => $emails]);
    } else {
        echo json_encode(['emails' => []]);
    }
    exit;
}

// Receive forwarded emails
if ($_POST['to'] && $_POST['from'] && $_POST['subject']) {
    $emailData = [
        'id' => uniqid(),
        'to' => $_POST['to'],
        'from' => $_POST['from'],
        'subject' => $_POST['subject'],
        'body' => $_POST['body'] ?? '',
        'timestamp' => date('c')
    ];
    
    $file = $emailsDir . md5($_POST['to']) . '.json';
    $emails = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    array_unshift($emails, $emailData);
    $emails = array_slice($emails, 0, 10); // Keep last 10
    
    file_put_contents($file, json_encode($emails));
    echo 'OK';
}
?>