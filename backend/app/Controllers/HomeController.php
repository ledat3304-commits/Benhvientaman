<?php

namespace App\Controllers;

use App\Models\Doctor;

/**
 * Class HomeController
 * Xử lý trang chủ, trang liên hệ và điều hướng người dùng đến dashboard phù hợp.
 */
class HomeController extends BaseController
{
    /**
     * Hiển thị trang chủ hoặc điều hướng dựa trên vai trò người dùng đã đăng nhập.
     */
    public function index()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // 1. Nếu chưa đăng nhập, hiển thị trang chủ công khai (Landing page)
        if (!isset($_SESSION['user'])) {
            $this->render('home/index', [
                'title' => 'Trang chủ - Bệnh viện Tâm An'
            ]);
            return;
        }

        // 2. Lấy thông tin vai trò và chuẩn hóa
        $user = $_SESSION['user'];
        $role = strtolower(trim($user['VaiTro'] ?? $user['vaitro'] ?? $_SESSION['role'] ?? ''));

        // 3. Điều hướng dựa trên vai trò
        switch ($role) {
            case 'quantri':
            case 'quanly':
            case 'admin':
                header('Location: /admin/dashboard');
                exit();

            case 'bacsi':
                header('Location: /doctor/dashboard');
                exit();

            case 'benhnhan':
                $this->render('dashboards/patient', [
                    'title' => 'Thông tin tài khoản - Bệnh viện Tâm An',
                    'user' => $user
                ], 'patient_layout');
                break;

            default:
                session_unset();
                session_destroy();
                header('Location: /login');
                exit();
        }
    }

    /**
     * Hiển thị trang Liên hệ của Bệnh viện Tâm An (Khớp route: /contact)
     */
    public function contact()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $this->render('home/contact', [
            'title' => 'Liên hệ - Bệnh viện Tâm An'
        ]);
    }

    /**
     * Hiển thị trang danh sách bác sĩ công khai cho bệnh nhân.
     */
    public function listDoctors()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $doctorModel = new Doctor();
        $doctors = method_exists($doctorModel, 'getAllWithSpecialty') 
            ? $doctorModel->getAllWithSpecialty() 
            : [];

        $this->render('doctors/index', [
            'title' => 'Đội ngũ Bác sĩ - Bệnh viện Tâm An',
            'doctors' => $doctors
        ]);
    }
}