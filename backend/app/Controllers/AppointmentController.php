<?php

namespace App\Controllers;

use Core\Database;
use PDO;
use PDOException;

class AppointmentController extends BaseController
{
    protected $db;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Hiển thị Form Đặt lịch hẹn khám
     */
    public function create()
    {
        $doctors = [];
        $services = [];

        // 1. Lấy danh sách Bác sĩ (Xử lý an toàn cho mọi cấu trúc CSDL)
        try {
            $sqlDoctors = "SELECT b.BacSiID, 
                           COALESCE(u.HoTen, b.TenBacSi, b.HoTen, CONCAT('Bác sĩ #', b.BacSiID)) AS HoTen, 
                           COALESCE(b.ChuyenKhoa, 'Đa khoa') AS ChuyenKhoa
                           FROM bacsi b
                           LEFT JOIN nguoidung u ON b.UserID = u.UserID";
            $stmt = $this->db->query($sqlDoctors);
            $doctors = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        } catch (PDOException $e) {
            try {
                // Fallback nếu không có bảng nguoidung hoặc câu JOIN bị lỗi
                $stmt = $this->db->query("SELECT * FROM bacsi");
                $doctors = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
            } catch (PDOException $ex) {
                $doctors = [];
            }
        }

        // 2. Lấy danh sách Dịch vụ (nếu có)
        try {
            $stmtServices = $this->db->query("SELECT * FROM danhmucdichvu WHERE HoatDong = 1");
            $services = $stmtServices ? $stmtServices->fetchAll(PDO::FETCH_ASSOC) : [];
        } catch (PDOException $e) {
            $services = [];
        }

        $this->render('appointments/create', [
            'title' => 'Đặt Lịch Khám - Bệnh viện Tâm An',
            'doctors' => $doctors,
            'services' => $services
        ]);
    }

    /**
     * Xử lý lưu lịch hẹn vào CSDL
     */
    public function store()
    {
        // 1. Kiểm tra đăng nhập
        if (!isset($_SESSION['user'])) {
            $_SESSION['error_message'] = 'Vui lòng đăng nhập trước khi đặt lịch khám!';
            header('Location: /login');
            exit();
        }

        // 2. Lấy thông tin Bệnh nhân
        $userId = $_SESSION['user']['UserID'] ?? null;
        $benhNhanId = $_SESSION['user']['BenhNhanID'] ?? null;

        // Nếu Session chưa có BenhNhanID, truy vấn trực tiếp từ DB
        if (!$benhNhanId && $userId) {
            try {
                $stmtBN = $this->db->prepare("SELECT BenhNhanID FROM benhnhan WHERE UserID = :uid LIMIT 1");
                $stmtBN->execute([':uid' => $userId]);
                $bnData = $stmtBN->fetch(PDO::FETCH_ASSOC);
                $benhNhanId = $bnData['BenhNhanID'] ?? null;
            } catch (PDOException $e) {
                $benhNhanId = null;
            }
        }

        $bacSiId = !empty($_POST['BacSiID']) ? intval($_POST['BacSiID']) : null;
        $thoiGianKham = trim($_POST['ThoiGianKham'] ?? '');
        $lyDoKham = trim($_POST['LyDoKham'] ?? '');

        // 3. Validation dữ liệu đầu vào
        if (empty($thoiGianKham)) {
            $_SESSION['error_message'] = 'Vui lòng chọn thời gian khám!';
            header('Location: /appointments/create');
            exit();
        }

        // 4. Lưu dữ liệu lịch hẹn
        try {
            $sql = "INSERT INTO lichhen (BenhNhanID, BacSiID, ThoiGianKham, GhiChu, TrangThai) 
                    VALUES (:bn_id, :bs_id, :thoigian, :lydo, 'ChoXacNhan')";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':bn_id' => $benhNhanId,
                ':bs_id' => $bacSiId,
                ':thoigian' => $thoiGianKham,
                ':lydo' => $lyDoKham
            ]);

            $_SESSION['success_message'] = 'Đăng ký lịch khám thành công! Bệnh viện Tâm An sẽ liên hệ xác nhận.';
            header('Location: /patient/appointments');
            exit();
        } catch (PDOException $e) {
            $_SESSION['error_message'] = 'Có lỗi xảy ra trong quá trình đặt lịch: ' . $e->getMessage();
            header('Location: /appointments/create');
            exit();
        }
    }
}