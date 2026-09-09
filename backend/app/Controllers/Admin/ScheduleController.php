<?php
namespace App\Controllers\Admin;

use App\Controllers\BaseController;
use App\Models\Doctor;
use App\Models\WorkSchedule;

class ScheduleController extends BaseController
{
    public function __construct()
    {
        // Middleware: Chỉ Admin mới có quyền truy cập
        if (!isset($_SESSION['user']) || $_SESSION['user']['VaiTro'] !== 'QuanTri') {
            $this->redirect('/login');
        }
    }

    /**
     * Hiển thị trang để chọn bác sĩ cần quản lý lịch.
     */
    public function index()
    {
        $doctorModel = new Doctor();
        $doctors = $doctorModel->findAll('HoTen');

        $this->render('admin/schedules/index', [
            'title' => 'Quản lý Lịch làm việc',
            'doctors' => $doctors
        ], 'admin');
    }

    /**
     * Hiển thị form để chỉnh sửa lịch làm việc của một bác sĩ cụ thể.
     * @param int $doctorId
     */
    public function edit(int $doctorId)
    {
        $doctorModel = new Doctor();
        $doctor = $doctorModel->find($doctorId);

        if (!$doctor) {
            die('Không tìm thấy bác sĩ.');
        }

        $scheduleModel = new WorkSchedule();
        $schedulesFromDb = $scheduleModel->findByDoctorId($doctorId);

        // Sắp xếp lịch vào một mảng có cấu trúc để view dễ xử lý
        $formattedSchedules = [];
        for ($i = 1; $i <= 7; $i++) {
            $dayIndex = ($i == 7) ? 0 : $i; // DB: 0=CN, 1=T2,...
            $formattedSchedules[$dayIndex] = [];
        }
        foreach ($schedulesFromDb as $slot) {
            $formattedSchedules[$slot['NgayTrongTuan']][] = $slot;
        }

        $this->render('admin/schedules/edit', [
            'title' => 'Sửa lịch làm việc cho: ' . htmlspecialchars($doctor['HoTen']),
            'doctor' => $doctor,
            'schedules' => $formattedSchedules
        ], 'admin');
    }

    /**
     * Cập nhật lịch làm việc cho bác sĩ.
     * @param int $doctorId
     */
    public function update(int $doctorId)
    {
        $postedData = $_POST['schedules'] ?? [];
        $newSchedules = [];

        foreach ($postedData as $day => $slots) {
            if (!empty($slots['start'])) {
                for ($i = 0; $i < count($slots['start']); $i++) {
                    $start = $slots['start'][$i];
                    $end = $slots['end'][$i];
                    if (!empty($start) && !empty($end)) {
                        $newSchedules[] = ['day' => $day, 'start' => $start, 'end' => $end];
                    }
                }
            }
        }

        try {
            $scheduleModel = new WorkSchedule();
            $scheduleModel->syncForDoctor($doctorId, $newSchedules);
            $_SESSION['success_message'] = 'Cập nhật lịch làm việc thành công!';
        } catch (\Exception $e) {
            $_SESSION['error_message'] = 'Lỗi khi cập nhật lịch: ' . $e->getMessage();
        }

        $this->redirect('/admin/schedules/' . $doctorId);
    }
}