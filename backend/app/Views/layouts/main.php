<?php
/**
 * Đây là file layout chính của ứng dụng.
 * Mọi view khác sẽ được "nhúng" vào trong layout này.
 * Nó chứa các thành phần chung như header, footer, và các thẻ <head> cơ bản.
 */

// Đảm bảo $baseUrl luôn có tiền tố chính xác
$baseUrl = $baseUrl ?? '/BenhvienTamAn/backend/public';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Tiêu đề trang (được truyền từ Controller) -->
    <title><?= $title ?? 'Bệnh viện Tâm An' ?></title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome (cho các biểu tượng) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- CSS tùy chỉnh (nối $baseUrl để không bị lỗi 404) -->
    <link rel="stylesheet" href="<?= $baseUrl ?>/css/style.css">
</head>
<body>

    <?php
        // Nạp nội dung từ file header.php
        require_once __DIR__ . '/header.php';
    ?>

    <!-- Vùng chứa nội dung chính của trang -->
    <main class="container my-4" style="min-height: 70vh;">
        <?php
        // Biến $content sẽ chứa HTML của view cụ thể (ví dụ: login.php, profile.php)
        echo $content ?? ''; 
        ?>
    </main>

    <?php
        // Nạp nội dung từ file footer.php
        require_once __DIR__ . '/footer.php';
    ?>

    <!-- SCRIPT LOADING SECTION -->
    <!-- Bootstrap JS (BẮT BUỘC cho dropdown, modal, v.v.) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JS (nối $baseUrl để chạy JS chính xác) -->
    <script src="<?= $baseUrl ?>/js/main.js"></script>

</body>
</html>