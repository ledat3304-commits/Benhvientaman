<?php

// 1. Khởi động bộ đệm đầu ra để tránh lỗi đứt lệnh header() redirect
ob_start();

// 2. Định nghĩa BASE_URL
if (!defined('BASE_URL')) {
    define('BASE_URL', getenv('APP_BASE_URL') ?: getenv('APP_URL') ?: '');
}

// 3. Bắt đầu session an toàn nếu chưa khởi chạy
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 4. Tự động nạp các class (Autoload cho cả App\ và Core\)
spl_autoload_register(function ($class) {
    $namespaces = [
        'App\\'  => __DIR__ . '/../app/',
        'Core\\' => __DIR__ . '/../core/'
    ];

    foreach ($namespaces as $prefix => $base_dir) {
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) === 0) {
            $relative_class = substr($class, $len);
            $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

            if (file_exists($file)) {
                require $file;
                return;
            }
        }
    }
});

// Nạp Composer Autoloader nếu có
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// 5. Tự động đăng nhập bằng cookie (Remember Me)
if (!isset($_SESSION['user']) && isset($_COOKIE['remember_me'])) {
    $parts = explode(':', $_COOKIE['remember_me'], 2);
    if (count($parts) === 2) {
        [$selector, $validator] = $parts;
        if ($selector && $validator) {
            $userModel = new \App\Models\User();
            if (method_exists($userModel, 'findUserByToken')) {
                $user = $userModel->findUserByToken($selector, $validator);
                if ($user) {
                    unset($user['MatKhau']);
                    $_SESSION['user'] = $user;
                } else {
                    setcookie('remember_me', '', time() - 3600, '/');
                }
            }
        }
    }
}

// 6. Khởi chạy Router và điều hướng ứng dụng
try {
    $router = new \Core\Router();

    // Nạp khai báo các tuyến đường
    if (file_exists(__DIR__ . '/../routes.php')) {
        require_once __DIR__ . '/../routes.php';
    } elseif (file_exists(__DIR__ . '/../app/routes.php')) {
        require_once __DIR__ . '/../app/routes.php';
    }

    // Lấy Request URI nguyên bản
    $rawUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

    // Tự động phát hiện và loại bỏ tiền tố thư mục dự án
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
    if ($scriptDir !== '/' && strpos($rawUri, $scriptDir) === 0) {
        $uri = substr($rawUri, strlen($scriptDir));
    } else {
        $uri = str_replace(['/BenhvienTamAn/backend/public', '/BenhvienTamAn/public', '/BenhvienTamAn'], '', $rawUri);
    }

    // Đảm bảo URI luôn bắt đầu bằng dấu / và hợp lệ
    $uri = '/' . ltrim($uri, '/');

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $router->dispatch($method, $uri);

} catch (\Exception $e) {
    http_response_code(500);
    echo '<div style="font-family: sans-serif; padding: 20px;">';
    echo '<h1 style="color: #dc3545;">Lỗi hệ thống</h1>';
    echo '<p style="font-size: 16px;">' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '</div>';
}