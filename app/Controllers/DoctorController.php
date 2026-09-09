<?php

namespace App\Controllers;

use App\Models\Doctor;
use App\Models\WorkSchedule;
use App\Models\Appointment;
use App\Models\Patient;

class DoctorController extends BaseController
{
    /**
     * Phương thức kiểm tra quyền Bác sĩ
     */
    private function checkDoctorAuth()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Kiểm tra thông tin user trong Session
        $user = $_SESSION['user'] ?? null;
        $role = '';

        if ($user) {
            $role = strtolower(trim($user['VaiTro'] ?? $user['vaitro'] ?? $_SESSION['role'] ?? ''));
        } elseif (isset($_SESSION['role'])) {
            $role = strtolower(trim($_SESSION['role']));
        }

        // Nếu người dùng chưa đăng nhập hoặc không phải vai trò 'bacsi'
        if (!$user || $role !== 'bacsi') {
            $_SESSION['error_message'] = 'Bạn không có quyền truy cập vào khu vực bác sĩ.';
            header('Location: /login');
            exit();
        }
    }

    /**
     * Hiển thị danh sách Đội ngũ Bác sĩ cho trang công khai (Dành cho khách xem)
     */
    public function index()
    {
        $doctorModel = new Doctor();
        $doctors = method_exists($doctorModel, 'getAllWithDetails') 
            ? $doctorModel->getAllWithDetails() 
            : [];

        $this->render('doctors/index', [
            'doctors' => $doctors
        ]);
    }

    /**
     * Trang Dashboard cho Bác sĩ đã đăng nhập
     */
    public function dashboard()
    {
        $this->checkDoctorAuth();

        $doctorModel = new Doctor();
        $doctorInfo = $doctorModel->findByUserId($_SESSION['user']['UserID']);
        
        if (!$doctorInfo) {
            die('Lỗi: Tài khoản này chưa được liên kết với hồ sơ Bác sĩ.');
        }

        $appointmentModel = new Appointment();
        $today = date('Y-m-d');
        $appointments = method_exists($appointmentModel, 'getAppointmentsForDoctorByDate') 
            ? $appointmentModel->getAppointmentsForDoctorByDate($doctorInfo['BacSiID'], $today)
            : [];

        $this->render('dashboards/doctor', [
            'title' => 'Bảng điều khiển Bác sĩ',
            'appointments' => $appointments,
            'user' => $_SESSION['user']
        ], 'doctor_layout');
    }

    /**
     * Quản lý lịch hẹn của Bác sĩ (/doctor/appointments)
     */
    public function appointments()
    {
        $this->checkDoctorAuth();

        $doctorModel = new Doctor();
        $doctorInfo = $doctorModel->findByUserId($_SESSION['user']['UserID']);
        
        if (!$doctorInfo) {
            die('Lỗi: Không tìm thấy thông tin bác sĩ.');
        }

        $appointmentModel = new Appointment();
        $appointments = method_exists($appointmentModel, 'findByDoctorId')
            ? $appointmentModel->findByDoctorId($doctorInfo['BacSiID'])
            : [];

        $this->render('doctors/appointments', [
            'title' => 'Quản lý Lịch hẹn',
            'appointments' => $appointments
        ], 'doctor_layout');
    }

    /**
     * Quản lý Lịch làm việc (/doctor/schedules)
     */
    public function schedules()
    {
        $this->checkDoctorAuth();
        
        $doctorModel = new Doctor();
        $doctorInfo = $doctorModel->findByUserId($_SESSION['user']['UserID']);

        if (!$doctorInfo) {
            die('Lỗi: Không tìm thấy thông tin bác sĩ.');
        }

        $scheduleModel = new WorkSchedule();
        $schedulesFromDb = method_exists($scheduleModel, 'findByDoctorId')
            ? $scheduleModel->findByDoctorId($doctorInfo['BacSiID'])
            : [];

        $formattedSchedules = [];
        for ($i = 1; $i <= 7; $i++) {
            $dayIndex = ($i == 7) ? 0 : $i;
            $formattedSchedules[$dayIndex] = [];
        }

        if (is_array($schedulesFromDb)) {
            foreach ($schedulesFromDb as $slot) {
                if (isset($slot['NgayTrongTuan'])) {
                    $formattedSchedules[$slot['NgayTrongTuan']][] = $slot;
                }
            }
        }

        $this->render('doctors/schedule', [
            'title' => 'Quản lý Lịch làm việc',
            'schedules' => $formattedSchedules
        ], 'doctor_layout');
    }

    /**
     * Lưu lịch làm việc
     */
    public function saveSchedule()
    {
        $this->checkDoctorAuth();

        $doctorModel = new Doctor();
        $doctorInfo = $doctorModel->findByUserId($_SESSION['user']['UserID']);

        if (!$doctorInfo) {
            $_SESSION['error_message'] = 'Không tìm thấy hồ sơ bác sĩ.';
            header('Location: /doctor/schedules');
            exit();
        }

        $postedData = $_POST['schedules'] ?? [];
        $newSchedules = [];

        foreach ($postedData as $day => $slots) {
            if (!empty($slots['start']) && is_array($slots['start'])) {
                for ($i = 0; $i < count($slots['start']); $i++) {
                    $start = $slots['start'][$i] ?? '';
                    $end = $slots['end'][$i] ?? '';
                    if (!empty($start) && !empty($end)) {
                        $newSchedules[] = [
                            'day' => $day,
                            'start' => $start,
                            'end' => $end
                        ];
                    }
                }
            }
        }

        try {
            $scheduleModel = new WorkSchedule();
            if (method_exists($scheduleModel, 'syncForDoctor')) {
                $scheduleModel->syncForDoctor($doctorInfo['BacSiID'], $newSchedules);
                $_SESSION['success_message'] = 'Cập nhật lịch làm việc thành công!';
            }
        } catch (\Exception $e) {
            $_SESSION['error_message'] = 'Đã có lỗi xảy ra khi cập nhật lịch.';
        }

        header('Location: /doctor/schedules');
        exit();
    }

    /**
     * Quản lý Bệnh nhân (/doctor/patients)
     */
    public function patients()
    {
        $this->checkDoctorAuth();

        $doctorModel = new Doctor();
        $doctorInfo = $doctorModel->findByUserId($_SESSION['user']['UserID']);
        
        if (!$doctorInfo) {
            die('Lỗi: Không tìm thấy thông tin bác sĩ.');
        }

        $patientModel = new Patient();
        $patients = method_exists($patientModel, 'findByDoctorId')
            ? $patientModel->findByDoctorId($doctorInfo['BacSiID'])
            : [];

        $this->render('doctors/patients', [
            'title' => 'Danh sách Bệnh nhân',
            'patients' => $patients
        ], 'doctor_layout');
    }

    /**
     * Hồ sơ cá nhân Bác sĩ
     */
    public function showProfile()
    {
        $this->checkDoctorAuth();

        $doctorModel = new Doctor();
        $doctorProfile = $doctorModel->findByUserId($_SESSION['user']['UserID']);

        if (!$doctorProfile) {
            die('Lỗi: Không tìm thấy hồ sơ bác sĩ.');
        }

        $this->render('doctors/profile', [
            'title' => 'Hồ sơ cá nhân',
            'doctor' => $doctorProfile
        ], 'doctor_layout');
    }

    /**
     * Cập nhật Hồ sơ cá nhân Bác sĩ
     */
    public function updateProfile()
    {
        $this->checkDoctorAuth();

        $dataToUpdate = [
            'MoTa' => $_POST['MoTa'] ?? '',
            'KinhNghiem' => $_POST['KinhNghiem'] ?? ''
        ];

        $doctorModel = new Doctor();
        $doctorInfo = $doctorModel->findByUserId($_SESSION['user']['UserID']);
        
        if ($doctorInfo) {
            $doctorModel->update($doctorInfo['BacSiID'], $dataToUpdate);
            $_SESSION['success_message'] = 'Cập nhật hồ sơ thành công!';
        } else {
            $_SESSION['error_message'] = 'Không thể cập nhật hồ sơ.';
        }

        header('Location: /doctor/profile');
        exit();
    }
}