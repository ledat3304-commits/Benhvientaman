<?php

namespace App\Controllers;

use Core\Database;
use PDO;

class ServiceController extends BaseController
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Hiển thị danh sách dịch vụ khám chữa bệnh công khai
     */
    public function index()
    {
        $stmt = $this->db->query("SELECT * FROM danhmucdichvu WHERE HoatDong = 1 ORDER BY DichVuID DESC");
        $services = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        $this->render('services/index', [
            'services' => $services
        ]);
    }

    public function apiIndex()
    {
        $stmt = $this->db->query("SELECT * FROM danhmucdichvu WHERE HoatDong = 1 ORDER BY DichVuID DESC");
        $services = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        $formatted = array_map(function ($service) {
            return [
                'id' => $service['DichVuID'] ?? null,
                'name' => $service['TenDichVu'] ?? 'Dịch vụ',
                'description' => $service['MoTa'] ?? 'Chưa có mô tả.',
                'price' => (int) ($service['DonGia'] ?? 0)
            ];
        }, $services);

        $this->json($formatted);
    }
}