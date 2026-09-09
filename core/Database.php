<?php

namespace Core;

use PDO;
use PDOException;

/**
 * Lớp quản lý kết nối CSDL sử dụng PDO và mẫu Singleton.
 */
class Database
{
    /**
     * @var Database|null Thể hiện (instance) duy nhất của lớp Database.
     */
    private static ?Database $instance = null;

    /**
     * @var PDO Đối tượng kết nối PDO.
     */
    public PDO $pdo;

    /**
     * Hàm khởi tạo private để ngăn việc tạo đối tượng từ bên ngoài.
     */
    private function __construct()
    {
        // Nạp thông tin cấu hình từ file config/database.php
        $config = require_once __DIR__ . '/../config/database.php';

        // Tạo chuỗi DSN (Data Source Name)
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['name']};charset={$config['charset']}";

        // Các tùy chọn cho kết nối PDO
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Ném ra Exception khi có lỗi
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Trả về kết quả dạng mảng kết hợp
            PDO::ATTR_EMULATE_PREPARES   => false,                  // Tắt chế độ mô phỏng prepared statements
        ];

        try {
            // Tạo đối tượng PDO mới
            $this->pdo = new PDO($dsn, $config['user'], $config['pass'], $options);
        } catch (PDOException $e) {
            // Nếu kết nối thất bại, hiển thị thông báo lỗi và dừng ứng dụng.
            die('Lỗi kết nối Cơ sở dữ liệu: ' . $e->getMessage());
        }
    }

    /**
     * Lấy về thể hiện duy nhất của lớp Database (Singleton pattern).
     *
     * @return Database
     */
    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Lấy về đối tượng kết nối PDO.
     *
     * @return PDO
     */
    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    /**
     * Ngăn chặn việc clone đối tượng (Singleton pattern).
     */
    private function __clone()
    {
    }

    /**
     * Ngăn chặn việc unserialize đối tượng (Singleton pattern).
     */
    public function __wakeup()
    {
    }
}
