<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Models\Specialty;

class SpecialtyController extends BaseController
{
    public function __construct()
    {
        // Middleware: Chỉ Admin mới có quyền truy cập
        if (!isset($_SESSION['user']) || $_SESSION['user']['VaiTro'] !== 'QuanTri') {
            $this->redirect('/login');
        }
    }

    /**
     * Hiển thị danh sách tất cả chuyên khoa.
     */
    public function index()
    {
        $specialtyModel = new Specialty();
        $specialties = $specialtyModel->findAll('TenChuyenKhoa');

        $this->render('admin/specialties/index', [
            'title' => 'Quản lý Chuyên khoa',
            'specialties' => $specialties
        ], 'admin');
    }

    /**
     * Hiển thị form để tạo chuyên khoa mới.
     */
    public function create()
    {
        $this->render('admin/specialties/create', ['title' => 'Thêm Chuyên khoa mới'], 'admin');
    }

    /**
     * Lưu chuyên khoa mới vào CSDL.
     */
    public function store()
    {
        $specialtyModel = new Specialty();
        $specialtyModel->create([
            'TenChuyenKhoa' => $_POST['TenChuyenKhoa'],
            'MoTa' => $_POST['MoTa']
        ]);

        $_SESSION['success_message'] = 'Thêm chuyên khoa thành công!';
        $this->redirect('/admin/specialties');
    }

    /**
     * Hiển thị form để chỉnh sửa chuyên khoa.
     * @param int $id
     */
    public function edit(int $id)
    {
        $specialtyModel = new Specialty();
        $specialty = $specialtyModel->find($id);

        if (!$specialty) {
            die('Không tìm thấy chuyên khoa.');
        }

        $this->render('admin/specialties/edit', [
            'title' => 'Chỉnh sửa Chuyên khoa',
            'specialty' => $specialty
        ], 'admin');
    }

    /**
     * Cập nhật chuyên khoa trong CSDL.
     * @param int $id
     */
    public function update(int $id)
    {
        $specialtyModel = new Specialty();
        $specialtyModel->update($id, [
            'TenChuyenKhoa' => $_POST['TenChuyenKhoa'],
            'MoTa' => $_POST['MoTa']
        ]);

        $_SESSION['success_message'] = 'Cập nhật chuyên khoa thành công!';
        $this->redirect('/admin/specialties');
    }

    /**
     * Xóa một chuyên khoa.
     * @param int $id
     */
    public function destroy(int $id)
    {
        $specialtyModel = new Specialty();
        $specialtyModel->delete($id);

        $_SESSION['success_message'] = 'Xóa chuyên khoa thành công!';
        $this->redirect('/admin/specialties');
    }
}
