<?php

namespace App\Controllers;

use App\Models\Patient;
use App\Models\Appointment;

class PatientController extends BaseController
{
    /**
     * Kiểm tra xác thực quyền Bệnh nhân
     */
    private function checkPatientAuth()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $user = $_SESSION['user'] ?? null;
        $role = '';

        if ($user) {
            $role = strtolower(trim($user['VaiTro'] ?? $user['vaitro'] ?? $_SESSION['role'] ?? ''));
        } elseif (isset($_SESSION['role'])) {
            $role = strtolower(trim($_SESSION['role']));
        }

        if (!$user || $role !== 'benhnhan') {
            $_SESSION['error_message'] = 'Bạn không có quyền truy cập vào khu vực bệnh nhân.';
            header('Location: /login');
            exit();
        }
    }

    /**
     * Danh sách lịch hẹn khám bệnh (/patient/appointments)
     */
    public function appointments()
    {
        $this->checkPatientAuth();

        $patientModel = new Patient();
        $patientInfo = $patientModel->findByUserId($_SESSION['user']['UserID']);

        $appointments = [];
        if ($patientInfo) {
            $appointmentModel = new Appointment();
            if (method_exists($appointmentModel, 'findByPatientId')) {
                $appointments = $appointmentModel->findByPatientId($patientInfo['BenhNhanID']);
            }
        }

        $this->render('patients/appointments', [
            'title' => 'Lịch hẹn của tôi',
            'patient' => $patientInfo ?: [],
            'appointments' => $appointments
        ], 'patient_layout');
    }

    /**
     * Lịch sử khám bệnh (/patient/history)
     */
    public function history()
    {
        $this->checkPatientAuth();

        $patientModel = new Patient();
        $patientInfo = $patientModel->findByUserId($_SESSION['user']['UserID']);

        $history = [];
        if ($patientInfo) {
            $appointmentModel = new Appointment();
            if (method_exists($appointmentModel, 'getHistoryByPatientId')) {
                $history = $appointmentModel->getHistoryByPatientId($patientInfo['BenhNhanID']);
            } elseif (method_exists($appointmentModel, 'findByPatientId')) {
                $history = $appointmentModel->findByPatientId($patientInfo['BenhNhanID']);
            }
        }

        // Truyền cả $patient và $history sang View để dứt điểm lỗi Undefined variable
        $this->render('patients/history', [
            'title' => 'Lịch sử khám bệnh',
            'patient' => $patientInfo ?: [],
            'history' => $history
        ], 'patient_layout');
    }
}