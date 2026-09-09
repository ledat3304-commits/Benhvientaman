<?php

namespace App\Controllers;

use App\Models\HealthProfile;
use App\Models\Patient;

class HealthProfileController extends BaseController
{
    /**
     * Hiển thị form quản lý thông tin sức khỏe.
     */
    public function index()
    {
        if (!isset($_SESSION['user']) || $_SESSION['user']['VaiTro'] !== 'BenhNhan') {
            $this->redirect('/login');
        }

        $patientModel = new Patient();
        $patient = $patientModel->findByUserId($_SESSION['user']['UserID']);

        $healthProfileModel = new HealthProfile();
        $healthInfo = $healthProfileModel->findByPatientId($patient['BenhNhanID']);

        $this->render('health_profile/index', [
            'title' => 'Thông tin Sức khỏe',
            'healthInfo' => $healthInfo
        ]);
    }

    /**
     * Xử lý cập nhật thông tin sức khỏe từ form.
     */
    public function update()
    {
        if (!isset($_SESSION['user']) || $_SESSION['user']['VaiTro'] !== 'BenhNhan') {
            $this->redirect('/login');
        }

        $patientModel = new Patient();
        $patient = $patientModel->findByUserId($_SESSION['user']['UserID']);

        $healthData = [];
        if (isset($_POST['health_info']) && is_array($_POST['health_info'])) {
            foreach ($_POST['health_info']['type'] as $key => $type) {
                $description = $_POST['health_info']['description'][$key];
                if (!empty($type) && !empty($description)) {
                    $healthData[] = [
                        'type' => $type,
                        'description' => $description
                    ];
                }
            }
        }

        try {
            $healthProfileModel = new HealthProfile();
            $healthProfileModel->syncForPatient($patient['BenhNhanID'], $healthData);
            $_SESSION['success_message'] = 'Cập nhật thông tin sức khỏe thành công!';
        } catch (\Exception $e) {
            $_SESSION['error_message'] = 'Lỗi khi cập nhật: ' . $e->getMessage();
        }

        $this->redirect('/patient/health-profile');
    }
}
