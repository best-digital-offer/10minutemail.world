<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Simple file-based email storage (use database in production)
$emailsDir = __DIR__ . '/emails/';
if (!is_dir($emailsDir)) {
    mkdir($emailsDir, 0755, true);
}

// Clean up old emails (older than 1 hour)
function cleanupOldEmails() {
    global $emailsDir;
    $files = glob($emailsDir . '*.json');
    $oneHourAgo = time() - 3600;
    
    foreach ($files as $file) {
        if (filemtime($file) < $oneHourAgo) {
            unlink($file);
        }
    }
}

// Get emails for a specific address
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['email'])) {
    cleanupOldEmails();
    
    $email = filter_var($_GET['email'], FILTER_SANITIZE_EMAIL);
    $emailFile = $emailsDir . md5($email) . '.json';
    
    if (file_exists($emailFile)) {
        $emails = json_decode(file_get_contents($emailFile), true) ?: [];
        echo json_encode(['emails' => $emails, 'count' => count($emails)]);
    } else {
        echo json_encode(['emails' => [], 'count' => 0]);
    }
    exit;
}

// Webhook for receiving emails (example for Mailgun)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    parse_str($input, $data);
    
    // Verify Mailgun signature (optional but recommended)
    if (isset($_ENV['MAILGUN_SIGNING_KEY'])) {
        $timestamp = $data['timestamp'] ?? '';
        $token = $data['token'] ?? '';
        $signature = $data['signature'] ?? '';
        
        $expectedSignature = hash_hmac('sha256', $timestamp . $token, $_ENV['MAILGUN_SIGNING_KEY']);
        if (!hash_equals($expectedSignature, $signature)) {
            http_response_code(401);
            exit('Unauthorized');
        }
    }
    
    // Extract email data
    $emailData = [
        'id' => uniqid() . time(),
        'to' => $data['recipient'] ?? '',
        'from' => $data['sender'] ?? '',
        'subject' => $data['subject'] ?? 'No Subject',
        'body' => $data['body-plain'] ?? $data['body-html'] ?? '',
        'timestamp' => date('c')
    ];
    
    // Store email
    $emailFile = $emailsDir . md5($emailData['to']) . '.json';
    $emails = [];
    
    if (file_exists($emailFile)) {
        $emails = json_decode(file_get_contents($emailFile), true) ?: [];
    }
    
    array_unshift($emails, $emailData);
    
    // Keep only last 10 emails per address
    $emails = array_slice($emails, 0, 10);
    
    file_put_contents($emailFile, json_encode($emails));
    
    echo 'OK';
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
?>