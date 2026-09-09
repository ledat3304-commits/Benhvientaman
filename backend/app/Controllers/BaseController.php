<?php

namespace App\Controllers;

/**
 * Class BaseController
 * Lớp controller cơ sở, chứa các phương thức chung mà các controller khác kế thừa.
 */
abstract class BaseController
{
    /**
     * Đường dẫn gốc của dự án dùng cho View/Layout.
     * Có thể cấu hình qua biến môi trường APP_BASE_URL.
     */
    protected string $baseUrl = '';

    /**
     * Render một view và bọc nó trong một layout.
     * @param string $view Tên file view.
     * @param array $data Dữ liệu cần truyền cho view.
     * @param ?string $layout Tên file layout. Nếu null, chỉ render view.
     */
    protected function render(string $view, array $data = [], ?string $layout = 'main')
    {
        // Truyền sẵn tiền tố baseUrl vào view để tiện tạo link
        $data['baseUrl'] = getenv('APP_BASE_URL') ?: $this->baseUrl;

        // Biến các key của mảng $data thành các biến riêng lẻ
        extract($data);

        // Bắt đầu bộ đệm đầu ra để "bắt" nội dung của file view
        ob_start();
        
        $viewFile = __DIR__ . '/../Views/' . $view . '.php';
        if (file_exists($viewFile)) {
            require $viewFile;
        } else {
            echo "Lỗi: Không tìm thấy file view tại: " . htmlspecialchars($viewFile);
        }
        
        // Lấy nội dung đã "bắt" được và lưu vào biến $content
        $content = ob_get_clean();

        // File layout sẽ sử dụng biến $content ở trên.
        if ($layout) {
            $layoutFile = __DIR__ . '/../Views/layouts/' . $layout . '.php';
            if (file_exists($layoutFile)) {
                require $layoutFile;
            } else {
                echo "Lỗi: Không tìm thấy file layout tại: " . htmlspecialchars($layoutFile);
            }
        } else {
            // Nếu không có layout, chỉ hiển thị nội dung của view
            echo $content;
        }
    }

    /**
     * Chuyển hướng người dùng đến một URL khác.
     * Tự động nối chính xác tiền tố dự án để không bị lỗi 404 trên Apache.
     *
     * @param string $url URL đích (ví dụ: '/login' hoặc '/admin/dashboard').
     */
    protected function redirect(string $url): void
{
    // Nếu là link tuyệt đối (http:// hoặc https://) thì giữ nguyên
    if (preg_match('#^https?://#i', $url)) {
        header("Location: {$url}");
        exit();
    }

    // Làm sạch các tiền tố lặp lại
    $cleanUrl = str_replace(['/BenhvienTamAn/backend/public', '/BenhvienTamAn/public', '/BenhvienTamAn'], '', $url);
    if (!str_starts_with($cleanUrl, '/')) {
        $cleanUrl = '/' . $cleanUrl;
    }

    // Ép chuyển hướng với BASE_URL chuẩn
    $target = BASE_URL . $cleanUrl;

    header("Location: {$target}");
    exit();
}

    /**
     * Trả về phản hồi dưới dạng JSON.
     * Hữu ích cho các yêu cầu API hoặc AJAX.
     *
     * @param array $data Dữ liệu cần chuyển thành JSON.
     * @param int $statusCode Mã trạng thái HTTP (mặc định là 200 OK).
     */
    protected function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        exit();
    }
}