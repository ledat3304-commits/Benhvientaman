<?php

namespace App\Models;

use PDO;

class Patient extends BaseModel
{
    protected string $table = 'benhnhan';
    protected string $primaryKey = 'BenhNhanID';

    /**
     * Lấy thông tin hồ sơ bệnh nhân dựa vào UserID.
     *
     * @param int $userId ID của người dùng trong bảng 'nguoidung'.
     * @return array|false Mảng dữ liệu bệnh nhân hoặc false nếu không tìm thấy.
     */
    public function findByUserId(int $userId): array|false
    {
        return $this->first('UserID', $userId);
    }

    /**
     * Lấy danh sách các bệnh nhân đã từng khám bởi một bác sĩ cụ thể.
     * Sử dụng DISTINCT để đảm bảo mỗi bệnh nhân chỉ xuất hiện một lần.
     *
     * @param int $doctorId ID của bác sĩ.
     * @return array Danh sách các bệnh nhân.
     */
    public function findByDoctorId(int $doctorId): array
    {
        $sql = "SELECT DISTINCT bn.*
                FROM {$this->table} AS bn
                JOIN lichkham AS lk ON bn.BenhNhanID = lk.BenhNhanID
                WHERE lk.BacSiID = ?
                ORDER BY bn.HoTen";
        
        $stmt = $this->query($sql, [$doctorId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Lấy tất cả bệnh nhân cho trang quản trị, có tìm kiếm.
     * @param string $searchTerm
     * @return array
     */
    public function getAllPatientsForAdmin(string $searchTerm = ''): array
    {
        $sql = "SELECT bn.*, u.Email 
                FROM {$this->table} AS bn
                LEFT JOIN nguoidung AS u ON bn.UserID = u.UserID";
        
        $params = [];
        if (!empty($searchTerm)) {
            $sql .= " WHERE bn.HoTen LIKE ? OR bn.SoDienThoai LIKE ? OR u.Email LIKE ?";
            $params = ["%{$searchTerm}%", "%{$searchTerm}%", "%{$searchTerm}%"];
        }
        
        $sql .= " ORDER BY bn.NgayTaoHoSo DESC";
        
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Lấy thông tin chi tiết của một bệnh nhân (join với nguoidung).
     * @param int $patientId
     * @return array|false
     */
    public function findPatientDetails(int $patientId)
    {
        $sql = "SELECT bn.*, u.Email 
                FROM {$this->table} AS bn
                LEFT JOIN nguoidung AS u ON bn.UserID = u.UserID
                WHERE bn.BenhNhanID = ?";
        
        $stmt = $this->query($sql, [$patientId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
