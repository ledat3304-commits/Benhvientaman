<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Models\User;

class UserController extends BaseController
{
    public function __construct()
    {
        $role = strtolower($_SESSION['user']['VaiTro'] ?? '');
        if (!isset($_SESSION['user']) || !in_array($role, ['quantrivien', 'admin', 'quan tri vien'])) {
            $_SESSION['error_message'] = 'Bạn không có quyền truy cập vào trang này.';
            $this->redirect('/login');
        }
    }

    /**
     * Hiển thị danh sách toàn bộ tài khoản người dùng.
     */
    public function index()
    {
        $userModel = new User();
        
        // Lấy tất cả danh sách người dùng từ CSDL
        $users = $userModel->all();

        // Render ra giao diện quản lý tài khoản
        $this->render('admin/users/index', [
            'title' => 'Quản lý tài khoản',
            'users' => $users
        ], 'admin');
    }
}