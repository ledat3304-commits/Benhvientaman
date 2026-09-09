<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use Core\Database;
use PDO;

class MedicineController extends BaseController
{
    protected $db;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Kiểm tra phân quyền Admin
        $user = $_SESSION['user'] ?? null;
        $role = strtolower(trim($user['VaiTro'] ?? $user['vaitro'] ?? $_SESSION['role'] ?? ''));
        $adminRoles = ['quanly', 'quantrivien', 'quantri', 'admin'];

        if (!$user || !in_array($role, $adminRoles)) {
            $_SESSION['error'] = 'Bạn không có quyền truy cập.';
            header('Location: /login');
            exit();
        }

        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Danh sách thuốc
     */
    public function index()
    {
        $stmt = $this->db->query("SELECT * FROM thuoc ORDER BY ThuocID DESC");
        $medicines = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        $this->render('admin/medicines/index', [
            'title' => 'Quản lý Thuốc',
            'medicines' => $medicines
        ]);
    }

    /**
     * Hiển thị Form thêm mới thuốc
     */
    public function create()
    {
        $this->render('admin/medicines/create', [
            'title' => 'Thêm mới Thuốc'
        ]);
    }

    /**
     * Xử lý lưu thuốc vào CSDL
     */
    public function store()
    {
        $tenThuoc = $_POST['TenThuoc'] ?? '';
        $donViTinh = $_POST['DonViTinh'] ?? '';
        $donGia = $_POST['DonGia'] ?? 0;
        $cachDung = $_POST['CachDung'] ?? '';

        if (!empty($tenThuoc)) {
            $sql = "INSERT INTO thuoc (TenThuoc, DonViTinh, DonGia, CachDung) VALUES (:ten, :dvt, :gia, :cachdung)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':ten' => $tenThuoc,
                ':dvt' => $donViTinh,
                ':gia' => $donGia,
                ':cachdung' => $cachDung
            ]);

            $_SESSION['success'] = 'Thêm thuốc mới thành công!';
            header('Location: /admin/medicines');
            exit();
        }

        $_SESSION['error'] = 'Tên thuốc không được để trống!';
        header('Location: /admin/medicines/create');
        exit();
    }
}