<?php

namespace App\Models;

use PDO;

class WorkSchedule extends BaseModel
{
    protected string $table = 'lichlamviec';
    protected string $primaryKey = 'LichLamViecID';

    /**
     * Lấy tất cả các khung giờ làm việc của một bác sĩ.
     *
     * @param int $doctorId ID của bác sĩ.
     * @return array Danh sách các khung giờ.
     */
    public function findByDoctorId(int $doctorId): array
    {
        $stmt = $this->query("SELECT * FROM {$this->table} WHERE BacSiID = ? ORDER BY NgayTrongTuan, GioBatDau", [$doctorId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Đồng bộ hóa lịch làm việc cho một bác sĩ.
     * Xóa tất cả lịch cũ và chèn vào lịch mới.
     *
     * @param int $doctorId ID của bác sĩ.
     * @param array $schedules Mảng lịch làm việc mới.
     */
    public function syncForDoctor(int $doctorId, array $schedules): void
    {
        $this->pdo->beginTransaction();
        try {
            // 1. Xóa tất cả lịch làm việc cũ của bác sĩ này
            $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE BacSiID = ?");
            $stmt->execute([$doctorId]);

            // 2. Thêm các lịch làm việc mới
            $insertSql = "INSERT INTO {$this->table} (BacSiID, NgayTrongTuan, GioBatDau, GioKetThuc) VALUES (?, ?, ?, ?)";
            $insertStmt = $this->pdo->prepare($insertSql);

            foreach ($schedules as $schedule) {
                $insertStmt->execute([
                    $doctorId,
                    $schedule['day'],
                    $schedule['start'],
                    $schedule['end']
                ]);
            }

            $this->pdo->commit();
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
