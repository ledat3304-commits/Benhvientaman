<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use Core\Database;
use PDO;

class AdminController extends BaseController
{
    protected $db;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // 1. Kiểm tra phân quyền Admin
        $user = $_SESSION['user'] ?? null;
        $role = '';
        if ($user) {
            $role = strtolower(trim($user['VaiTro'] ?? $user['vaitro'] ?? $_SESSION['role'] ?? ''));
        } else if (isset($_SESSION['role'])) {
            $role = strtolower(trim($_SESSION['role']));
        }

        $adminRoles = ['quanly', 'quantrivien', 'quantri', 'admin'];

        if (!$user || !in_array($role, $adminRoles)) {
            $_SESSION['error'] = 'Bạn không có quyền truy cập vào trang quản trị.';
            header('Location: /login');
            exit();
        }

        // 2. Khởi tạo kết nối CSDL
        $this->db = Database::getInstance()->getConnection();
    }

    public function index()
    {
        // Thống kê Lịch hẹn chờ xác nhận
        $stmtPending = $this->db->query("SELECT COUNT(*) FROM lichkham WHERE TrangThai = 'ChoXacNhan'");
        $pendingAppointments = $stmtPending->fetchColumn();

        // Thống kê Khám hôm nay / Đã hoàn thành hôm nay
        $stmtToday = $this->db->query("SELECT COUNT(*) FROM lichkham WHERE DATE(ThoiGianKham) = CURDATE()");
        $todayAppointments = $stmtToday->fetchColumn();

        $stmtCompletedToday = $this->db->query("SELECT COUNT(*) FROM lichkham WHERE DATE(ThoiGianKham) = CURDATE() AND TrangThai = 'DaHoanThanh'");
        $completedToday = $stmtCompletedToday->fetchColumn();

        // Thống kê Tổng số Bác sĩ & Bệnh nhân
        $stmtDoctors = $this->db->query("SELECT COUNT(*) FROM bacsi");
        $totalDoctors = $stmtDoctors->fetchColumn();

        $stmtPatients = $this->db->query("SELECT COUNT(*) FROM benhnhan");
        $totalPatients = $stmtPatients->fetchColumn();

        // Định nghĩa đầy đủ tất cả biến Key có thể được View dashboard.php gọi
        $stats = [
            'pending_appointments' => $pendingAppointments ?: 0,
            'today_appointments'   => $todayAppointments ?: 0,
            'completed_today'     => $completedToday ?: 0,
            'total_doctors'        => $totalDoctors ?: 0,
            'total_patients'       => $totalPatients ?: 0,
        ];

        // Lấy danh sách 10 Lịch hẹn gần đây
        $sqlRecent = "SELECT l.*, b.HoTen AS TenBenhNhan, nd.HoTen AS TenBacSi 
                      FROM lichkham l
                      LEFT JOIN benhnhan b ON l.BenhNhanID = b.BenhNhanID
                      LEFT JOIN bacsi bs ON l.BacSiID = bs.BacSiID
                      LEFT JOIN nguoidung nd ON bs.UserID = nd.UserID
                      ORDER BY l.ThoiGianKham DESC LIMIT 10";
        $stmtRecent = $this->db->query($sqlRecent);
        $recentAppointments = $stmtRecent->fetchAll(PDO::FETCH_ASSOC);

        $this->render('admin/dashboard', [
            'stats'              => $stats,
            'recentAppointments' => $recentAppointments
        ]);
    }

    public function dashboard()
    {
        $this->index();
    }
}