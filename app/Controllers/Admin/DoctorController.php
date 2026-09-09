<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Specialty;


class DoctorController extends BaseController
{
    public function __construct()
    {
        // Middleware: Chỉ Admin mới có quyền truy cập
        if (!isset($_SESSION['user']) || $_SESSION['user']['VaiTro'] !== 'QuanTri') {
            $this->redirect('/login');
        }
    }

    /**
     * Hiển thị danh sách tất cả bác sĩ.
     */
    public function index()
    {
        $doctorModel = new Doctor();
        $doctors = $doctorModel->getAllDoctorsForAdmin();

        $this->render('admin/doctors/index', [
            'title' => 'Quản lý Bác sĩ',
            'doctors' => $doctors
        ], 'admin');
    }

    /**
     * Hiển thị form để tạo bác sĩ mới.
     */
    public function create()
    {
        $specialtyModel = new Specialty();
        $specialties = $specialtyModel->findAll();

        $this->render('admin/doctors/create', [
            'title' => 'Thêm Bác sĩ mới',
            'specialties' => $specialties
        ], 'admin');
    }

    /**
     * Lưu bác sĩ mới vào CSDL.
     */
    public function store()
    {
        $db = (\Core\Database::getInstance())->getConnection();
        $db->beginTransaction();

        try {
            // 1. Tạo tài khoản trong bảng `nguoidung`
            $userModel = new User();
            $userId = $userModel->create([
                'HoTen' => $_POST['HoTen'],
                'Email' => $_POST['Email'],
                'SoDienThoai' => $_POST['SoDienThoai'],
                'MatKhau' => password_hash($_POST['MatKhau'], PASSWORD_DEFAULT),
                'VaiTro' => 'BacSi',
                'HoatDong' => 1
            ]);

            // 2. Tạo hồ sơ trong bảng `bacsi`
            $doctorModel = new Doctor();
            $doctorModel->create([
                'UserID' => $userId,
                'ChuyenKhoaID' => $_POST['ChuyenKhoaID'] ?: null,
                'KinhNghiem' => $_POST['KinhNghiem'],
                'MoTa' => $_POST['MoTa']
            ]);

            $db->commit();
            $_SESSION['success_message'] = 'Thêm bác sĩ mới thành công!';
        } catch (\Exception $e) {
            $db->rollBack();
            $_SESSION['error_message'] = 'Lỗi khi thêm bác sĩ: ' . $e->getMessage();
        }

        $this->redirect('/admin/doctors');
    }
}