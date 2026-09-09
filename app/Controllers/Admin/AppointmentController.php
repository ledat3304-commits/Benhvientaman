<?php

namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Models\Appointment;
use App\Models\Doctor;

class AppointmentController extends BaseController
{
    public function __construct()
    {
        // Middleware: Chỉ Admin mới có quyền truy cập
        if (!isset($_SESSION['user']) || $_SESSION['user']['VaiTro'] !== 'QuanTri') {
            $this->redirect('/login');
        }
    }

    /**
     * Hiển thị danh sách tất cả lịch hẹn với bộ lọc.
     */
    public function index()
    {
        $appointmentModel = new Appointment();
        $doctorModel = new Doctor();

        // Lấy các tham số lọc từ URL
        $filters = [
            'status' => $_GET['status'] ?? '',
            'doctor_id' => $_GET['doctor_id'] ?? '',
            'date' => $_GET['date'] ?? ''
        ];

        $appointments = $appointmentModel->getAllAppointmentsForAdmin($filters);
        $doctors = $doctorModel->findAll('HoTen'); // Lấy danh sách bác sĩ để lọc

        $this->render('admin/appointments/index', [
            'title' => 'Quản lý Lịch hẹn',
            'appointments' => $appointments,
            'doctors' => $doctors,
            'filters' => $filters
        ], 'admin');
    }

    /**
     * Cập nhật trạng thái của một lịch hẹn.
     * @param int $id ID của lịch hẹn.
     */
    public function updateStatus(int $id)
    {
        $newStatus = $_POST['status'] ?? null;
        $validStatuses = ['DaXacNhan', 'DaHuy', 'DaHoanThanh'];

        if ($newStatus && in_array($newStatus, $validStatuses)) {
            $appointmentModel = new Appointment();
            $appointmentModel->update($id, ['TrangThai' => $newStatus]);
            $_SESSION['success_message'] = 'Cập nhật trạng thái thành công!';
        } else {
            $_SESSION['error_message'] = 'Trạng thái không hợp lệ.';
        }

        $this->redirect('/admin/appointments');
    }
}