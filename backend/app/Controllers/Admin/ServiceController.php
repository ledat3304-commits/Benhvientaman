<?php
namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Models\Service;

class ServiceController extends BaseController
{
    public function __construct()
    {
        if (!isset($_SESSION['user']) || $_SESSION['user']['VaiTro'] !== 'QuanTri') {
            $this->redirect('/login');
        }
    }

    public function index()
    {
        $serviceModel = new Service();
        $services = $serviceModel->findAll('TenDichVu');

        $this->render('admin/services/index', [
            'title' => 'Quản lý Dịch vụ',
            'services' => $services
        ], 'admin');
    }

    public function create()
    {
        $this->render('admin/services/create', ['title' => 'Thêm Dịch vụ mới'], 'admin');
    }

    public function store()
    {
        $serviceModel = new Service();
        $serviceModel->create([
            'TenDichVu' => $_POST['TenDichVu'],
            'MoTa' => $_POST['MoTa'],
            'DonGia' => $_POST['DonGia'],
            'HoatDong' => $_POST['HoatDong'] ?? 0
        ]);

        $_SESSION['success_message'] = 'Thêm dịch vụ thành công!';
        $this->redirect('/admin/services');
    }

    public function edit(int $id)
    {
        $serviceModel = new Service();
        $service = $serviceModel->find($id);

        if (!$service) {
            die('Không tìm thấy dịch vụ.');
        }

        $this->render('admin/services/edit', [
            'title' => 'Chỉnh sửa Dịch vụ',
            'service' => $service
        ], 'admin');
    }

    public function update(int $id)
    {
        $serviceModel = new Service();
        $serviceModel->update($id, [
            'TenDichVu' => $_POST['TenDichVu'],
            'MoTa' => $_POST['MoTa'],
            'DonGia' => $_POST['DonGia'],
            'HoatDong' => $_POST['HoatDong'] ?? 0
        ]);

        $_SESSION['success_message'] = 'Cập nhật dịch vụ thành công!';
        $this->redirect('/admin/services');
    }

    public function destroy(int $id)
    {
        $serviceModel = new Service();
        $serviceModel->delete($id);

        $_SESSION['success_message'] = 'Xóa dịch vụ thành công!';
        $this->redirect('/admin/services');
    }
}