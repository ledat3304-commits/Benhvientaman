<?php

namespace App\Models;

use PDO;

class Prescription extends BaseModel
{
    protected string $table = 'donthuoc';
    protected string $primaryKey = 'DonThuocID';

    /**
     * Lấy đơn thuốc của một lần khám.
     * @param int $appointmentId
     * @return array
     */
    public function findByAppointmentId(int $appointmentId): array
    {
        $sql = "SELECT dt.*, dmt.TenThuoc, dmt.DonViTinh 
                FROM {$this->table} dt
                JOIN danhmucthuoc dmt ON dt.ThuocID = dmt.ThuocID
                WHERE dt.LichKhamID = ?";
        $stmt = $this->query($sql, [$appointmentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
