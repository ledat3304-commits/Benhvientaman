<?php
require_once __DIR__ . '/../app/Models/BaseModel.php';
require_once __DIR__ . '/../app/Models/User.php';

// Khởi tạo kết nối CSDL và tạo mật khẩu mới băm chuẩn BCRYPT
$newPassword = password_hash('12341234', PASSWORD_BCRYPT);

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=doan1;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Cập nhật mật khẩu chuẩn cho tài khoản Admin
    $stmt = $pdo->prepare("UPDATE nguoidung SET MatKhau = :pass, VaiTro = 'QuanTriVien' WHERE Email = 'admin@gmail.com'");
    $stmt->execute(['pass' => $newPassword]);

    echo "<h3>Đã cập nhật mật khẩu mới thành công!</h3>";
    echo "Email: <b>admin@gmail.com</b><br>";
    echo "Mật khẩu: <b>12341234</b><br>";
    echo "Chuỗi BCRYPT sinh ra: <code>" . $newPassword . "</code>";
} catch (PDOException $e) {
    echo "Lỗi: " . $e->getMessage();
}