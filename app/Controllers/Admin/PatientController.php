<?php

namespace App\Controllers;

use App\Models\Patient;
use App\Models\Appointment;
use Core\Database;
use PDO;

class PatientController extends BaseController
{
    /**
     * Kiểm tra phân quyền Bệnh nhân
     */
    private function checkPatientAuth()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $user = $_SESSION['user'] ?? null;
        $role = '';

        if ($user) {
            $role = strtolower(trim($user['VaiTro'] ?? $user['vaitro'] ?? $_SESSION['role'] ?? ''));
        } elseif (isset($_SESSION['role'])) {
            $role = strtolower(trim($_SESSION['role']));
        }

        if (!$user || $role !== 'benhnhan') {
            $_SESSION['error_message'] = 'Bạn không có quyền truy cập vào khu vực bệnh nhân.';
            header('Location: /login');
            exit();
        }
    }

    /**
     * Xem thông tin hồ sơ cá nhân (/patient/profile)
     */
    public function profile()
    {
        $this->checkPatientAuth();

        $db = Database::getInstance()->getConnection();
        $userId = $_SESSION['user']['UserID'] ?? $_SESSION['user_id'] ?? 0;

        $stmt = $db->prepare("SELECT * FROM benhnhan WHERE UserID = :uid LIMIT 1");
        $stmt->execute([':uid' => $userId]);
        $patient = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->render('patients/profile', [
            'title' => 'Hồ sơ cá nhân - Bệnh viện Tâm An',
            'patient' => $patient ?: ($_SESSION['user'] ?? [])
        ], 'patient_layout');
    }

    /**
     * Alias phương thức nếu Router gọi showProfile
     */
    public function showProfile()
    {
        $this->profile();
    }

    /**
     * Cập nhật thông tin hồ sơ cá nhân (/patient/profile/update)
     */
    public function updateProfile()
    {
        $this->checkPatientAuth();

        $db = Database::getInstance()->getConnection();
        $userId = $_SESSION['user']['UserID'] ?? $_SESSION['user_id'] ?? 0;

        $hoTen = $_POST['HoTen'] ?? '';
        $sdt = $_POST['SoDienThoai'] ?? '';
        $ngaySinh = $_POST['NgaySinh'] ?? null;
        $gioiTinh = $_POST['GioiTinh'] ?? 'Nam';
        $diaChi = $_POST['DiaChi'] ?? '';

        $stmtCheck = $db->prepare("SELECT BenhNhanID FROM benhnhan WHERE UserID = :uid");
        $stmtCheck->execute([':uid' => $userId]);
        $exists = $stmtCheck->fetch();

        if ($exists) {
            $sql = "UPDATE benhnhan SET HoTen = :hoten, SoDienThoai = :sdt, NgaySinh = :ngaysinh, GioiTinh = :gioitinh, DiaChi = :diachi WHERE UserID = :uid";
        } else {
            $sql = "INSERT INTO benhnhan (UserID, HoTen, SoDienThoai, NgaySinh, GioiTinh, DiaChi) VALUES (:uid, :hoten, :sdt, :ngaysinh, :gioitinh, :diachi)";
        }

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':uid' => $userId,
            ':hoten' => $hoTen,
            ':sdt' => $sdt,
            ':ngaysinh' => $ngaySinh,
            ':gioitinh' => $gioiTinh,
            ':diachi' => $diaChi
        ]);

        $_SESSION['user']['HoTen'] = $hoTen;
        $_SESSION['success_message'] = 'Cập nhật hồ sơ thành công!';

        header('Location: /patient/profile');
        exit();
    }

    /**
     * Danh sách lịch hẹn (/patient/appointments)
     */
    public function appointments()
    {
        $this->checkPatientAuth();

        $userId = $_SESSION['user']['UserID'] ?? $_SESSION['user_id'] ?? 0;
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT a.*, b.TenBacSi, u.HoTen AS TenBacSiFull 
                               FROM lichhen a 
                               LEFT JOIN bacsi b ON a.BacSiID = b.BacSiID 
                               LEFT JOIN nguoidung u ON b.UserID = u.UserID 
                               LEFT JOIN benhnhan bn ON a.BenhNhanID = bn.BenhNhanID 
                               WHERE bn.UserID = :uid OR a.BenhNhanID = :uid 
                               ORDER BY a.ThoiGianKham DESC");
        $stmt->execute([':uid' => $userId]);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->render('patients/appointments', [
            'title' => 'Lịch hẹn của tôi',
            'appointments' => $appointments
        ], 'patient_layout');
    }
}