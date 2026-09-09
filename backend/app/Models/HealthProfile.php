<?php

namespace App\Models;

use PDO;

class HealthProfile extends BaseModel
{
    protected string $table = 'thongtinsuckhoe';
    protected string $primaryKey = 'ThongTinID';

    /**
     * Lấy tất cả thông tin sức khỏe của một bệnh nhân.
     * @param int $patientId
     * @return array
     */
    public function findByPatientId(int $patientId): array
    {
        return $this->findAllBy('BenhNhanID', $patientId);
    }

    /**
     * Đồng bộ hóa thông tin sức khỏe cho bệnh nhân.
     * Xóa tất cả thông tin cũ và thêm lại từ form.
     * @param int $patientId
     * @param array $healthData
     */
    public function syncForPatient(int $patientId, array $healthData): void
    {
        $this->pdo->beginTransaction();
        try {
            // 1. Xóa tất cả thông tin cũ
            $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE BenhNhanID = ?");
            $stmt->execute([$patientId]);

            // 2. Thêm thông tin mới
            $sql = "INSERT INTO {$this->table} (BenhNhanID, Loai, MoTa) VALUES (?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);

            foreach ($healthData as $item) {
                if (!empty($item['type']) && !empty($item['description'])) {
                    $stmt->execute([$patientId, $item['type'], $item['description']]);
                }
            }

            $this->pdo->commit();
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
