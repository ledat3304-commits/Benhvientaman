<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\Patient;
use PDOException;
use App\Services\MailService;

class AuthController extends BaseController
{
    /**
     * Hiển thị trang đăng nhập.
     */
    public function showLogin()
    {
        $this->showLoginForm();
    }

    public function showLoginForm()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Tự động chuyển hướng nếu đã đăng nhập
        if (isset($_SESSION['user']) && empty($_SESSION['error']) && empty($_SESSION['error_message'])) {
            $role = strtolower(trim($_SESSION['user']['VaiTro'] ?? $_SESSION['user']['vaitro'] ?? $_SESSION['role'] ?? ''));
            switch ($role) {
                case 'quanly':
                case 'quantrivien':
                case 'quantri':
                case 'admin':
                    header('Location: /admin/dashboard');
                    exit();
                case 'bacsi':
                    header('Location: /doctor/appointments');
                    exit();
                case 'benhnhan':
                    header('Location: /patient/appointments');
                    exit();
                default:
                    header('Location: /');
                    exit();
            }
        }

        $this->render('auth/login', ['title' => 'Đăng nhập - Bệnh viện Tâm An']);

        unset($_SESSION['error']);
        unset($_SESSION['error_message']);
    }

    /**
     * Xử lý yêu cầu đăng nhập từ form.
     */
    public function login()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        unset($_SESSION['error']);
        unset($_SESSION['error_message']);

        // 1. Nhận linh hoạt tất cả các tên input có thể có từ View (username / identifier / email)
        $identifier = trim($_POST['username'] ?? $_POST['identifier'] ?? $_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $rememberMe = isset($_POST['remember_me']) || isset($_POST['remember']);

        if (empty($identifier) || empty($password)) {
            $_SESSION['error_message'] = 'Vui lòng nhập đầy đủ Tên đăng nhập/Email và Mật khẩu!';
            header('Location: /login');
            exit();
        }

        // 2. Tìm người dùng trong CSDL
        $userModel = new User();
        $user = null;

        if (method_exists($userModel, 'findByIdentifier')) {
            $user = $userModel->findByIdentifier($identifier);
        } else {
            // Truy vấn trực tiếp bằng Database PDO nếu Model chưa có hàm
            $db = \Core\Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT * FROM nguoidung WHERE Email = :id OR SoDienThoai = :id OR TenDangNhap = :id LIMIT 1");
            $stmt->execute([':id' => $identifier]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        }

        // 3. Kiểm tra sự tồn tại của tài khoản
        if (!$user) {
            $_SESSION['error_message'] = 'Tài khoản hoặc mật khẩu không chính xác.';
            header('Location: /login');
            exit();
        }

        // Kiểm tra tài khoản bị khóa
        if (isset($user['HoatDong']) && $user['HoatDong'] == 0) {
            $_SESSION['error_message'] = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.';
            header('Location: /login');
            exit();
        }

        // 4. Kiểm tra mật khẩu (Tương thích BCRYPT, MD5 & PlainText)
        $dbPassword = $user['MatKhau'] ?? $user['matkhau'] ?? '';
        $isPasswordValid = false;

        if (!empty($dbPassword)) {
            if (password_verify($password, $dbPassword)) {
                $isPasswordValid = true;
            } elseif (md5($password) === $dbPassword || $password === $dbPassword) {
                $isPasswordValid = true;

                // Tự động nâng cấp mật khẩu cũ sang Bcrypt Hash
                $newHash = password_hash($password, PASSWORD_BCRYPT);
                if (method_exists($userModel, 'updatePassword')) {
                    $userModel->updatePassword((int)$user['UserID'], $newHash);
                } else {
                    $db = \Core\Database::getInstance()->getConnection();
                    $stmtUpdate = $db->prepare("UPDATE nguoidung SET MatKhau = :hash WHERE UserID = :uid");
                    $stmtUpdate->execute([':hash' => $newHash, ':uid' => $user['UserID']]);
                }
            }
        }

        if ($isPasswordValid) {
            unset($user['MatKhau']); 

            $_SESSION['user'] = $user;
            $_SESSION['user_id'] = $user['UserID'] ?? $user['userid'] ?? null;
            $_SESSION['role'] = $user['VaiTro'] ?? $user['vaitro'] ?? 'BenhNhan';

            if ($rememberMe) {
                $this->createRememberMeToken((int)$_SESSION['user_id']);
            }

            // Điều hướng theo vai trò
            $role = strtolower(trim($_SESSION['role']));
            switch ($role) {
                case 'quanly':
                case 'quantrivien':
                case 'quantri':
                case 'admin':
                    header('Location: /admin/dashboard');
                    exit();
                case 'bacsi':
                    header('Location: /doctor/dashboard');
                    exit();
                case 'benhnhan':
                    header('Location: /patient/profile');
                    exit();
                default:
                    header('Location: /');
                    exit();
            }
        } else {
            $_SESSION['error_message'] = 'Tài khoản hoặc mật khẩu không chính xác.';
            header('Location: /login');
            exit();
        }
    }

    /**
     * Xử lý đăng xuất.
     */
    public function logout()
    {
        if (isset($_COOKIE['remember_me'])) {
            list($selector, ) = explode(':', $_COOKIE['remember_me'], 2);
            $userModel = new User();
            if (method_exists($userModel, 'deleteAuthTokenBySelector')) {
                $userModel->deleteAuthTokenBySelector($selector);
            }
            setcookie('remember_me', '', time() - 3600, '/');
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION = array();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();

        header('Location: /login');
        exit();
    }

    /**
     * Hiển thị trang đăng ký.
     */
    public function showRegister()
    {
        $this->showRegisterForm();
    }

    public function showRegisterForm()
    {
        $this->render('auth/register', ['title' => 'Đăng ký tài khoản - Bệnh viện Tâm An']);
    }

    /**
     * Xử lý gửi mã OTP (Hỗ trợ cả Fetch API lẫn AJAX tiêu chuẩn)
     */
    public function sendOtp()
    {
        header('Content-Type: application/json');

        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        $email = $data['email'] ?? $_POST['email'] ?? null;

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Địa chỉ email không hợp lệ.']);
            return;
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $otp = rand(100000, 999999);
        $_SESSION['otp'] = $otp;
        $_SESSION['otp_email'] = $email;
        $_SESSION['otp_expires_at'] = time() + 300;

        // Trả OTP ngay trên localhost để test tiện lợi
        if (class_exists('App\Services\MailService')) {
            try {
                $mailService = new MailService();
                if (method_exists($mailService, 'sendOtp')) {
                    $mailService->sendOtp($email, $otp);
                }
            } catch (\Exception $e) {
                // Tiếp tục để trả về response test
            }
        }

        echo json_encode([
            'success' => true, 
            'message' => 'Mã OTP đã được tạo thành công.',
            'otp' => $otp
        ]);
    }

    /**
     * Xử lý đăng ký tài khoản mới.
     */
    public function register()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $data = [
            'HoTen' => trim($_POST['HoTen'] ?? $_POST['hoten'] ?? ''),
            'NgaySinh' => $_POST['NgaySinh'] ?? null,
            'GioiTinh' => $_POST['GioiTinh'] ?? 'Nam',
            'Email' => trim($_POST['Email'] ?? $_POST['email'] ?? ''),
            'SoDienThoai' => trim($_POST['SoDienThoai'] ?? $_POST['sdt'] ?? ''),
            'MatKhau' => $_POST['MatKhau'] ?? $_POST['password'] ?? '',
            'confirm_password' => $_POST['confirm_password'] ?? $_POST['confirm_password'] ?? '',
            'otp' => trim($_POST['otp'] ?? '')
        ];

        if (empty($data['HoTen']) || empty($data['Email']) || empty($data['MatKhau'])) {
            $_SESSION['error_message'] = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
            header('Location: /register');
            exit();
        }

        // Kiểm tra OTP nếu hệ thống yêu cầu
        if (!empty($data['otp'])) {
            if (
                empty($_SESSION['otp']) ||
                $data['otp'] != $_SESSION['otp'] ||
                $data['Email'] != $_SESSION['otp_email'] ||
                time() > $_SESSION['otp_expires_at']
            ) {
                $_SESSION['error_message'] = 'Mã OTP không hợp lệ hoặc đã hết hạn.';
                header('Location: /register');
                exit();
            }
        }

        if ($data['MatKhau'] !== $data['confirm_password'] && !empty($data['confirm_password'])) {
            $_SESSION['error_message'] = 'Mật khẩu xác nhận không khớp.';
            header('Location: /register');
            exit();
        }

        $userModel = new User();

        try {
            $hashedPassword = password_hash($data['MatKhau'], PASSWORD_BCRYPT);

            $newUserId = null;
            if (method_exists($userModel, 'create')) {
                $newUserId = $userModel->create([
                    'HoTen' => $data['HoTen'],
                    'Email' => $data['Email'],
                    'SoDienThoai' => $data['SoDienThoai'],
                    'MatKhau' => $hashedPassword,
                    'VaiTro' => 'BenhNhan'
                ]);
            } else {
                $db = \Core\Database::getInstance()->getConnection();
                $stmt = $db->prepare("INSERT INTO nguoidung (HoTen, Email, SoDienThoai, MatKhau, VaiTro) VALUES (:hoten, :email, :sdt, :pass, 'BenhNhan')");
                $stmt->execute([
                    ':hoten' => $data['HoTen'],
                    ':email' => $data['Email'],
                    ':sdt' => $data['SoDienThoai'],
                    ':pass' => $hashedPassword
                ]);
                $newUserId = $db->lastInsertId();
            }

            if ($newUserId) {
                $patientModel = new Patient();
                if (method_exists($patientModel, 'create')) {
                    $patientModel->create([
                        'UserID' => $newUserId,
                        'HoTen' => $data['HoTen'],
                        'NgaySinh' => $data['NgaySinh'],
                        'GioiTinh' => $data['GioiTinh'],
                        'SoDienThoai' => $data['SoDienThoai']
                    ]);
                }
            }

            $_SESSION['success_message'] = 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.';
            header('Location: /login');
            exit();

        } catch (PDOException $e) {
            if (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062) {
                $_SESSION['error_message'] = 'Email hoặc Số điện thoại đã được đăng ký.';
            } else {
                $_SESSION['error_message'] = 'Đã có lỗi xảy ra: ' . $e->getMessage();
            }
            header('Location: /register');
            exit();
        }
    }

    /**
     * Tạo token Ghi nhớ đăng nhập.
     */
    private function createRememberMeToken(int $userId)
    {
        $userModel = new User();
        $selector = bin2hex(random_bytes(16));
        $validator = bin2hex(random_bytes(32));
        $validatorHash = password_hash($validator, PASSWORD_DEFAULT);
        $expiresAt = date('Y-m-d H:i:s', time() + 86400 * 30);

        if (method_exists($userModel, 'createAuthToken')) {
            $userModel->createAuthToken($userId, $selector, $validatorHash, $expiresAt);
        }

        $cookieValue = $selector . ':' . $validator;
        setcookie('remember_me', $cookieValue, time() + 86400 * 30, '/', '', false, true);
    }
}