<?php

namespace App\Models;

use PDO;

class Service extends BaseModel
{
    protected string $table = 'danhmucdichvu';
    protected string $primaryKey = 'DichVuID';

    /**
     * Lấy tất cả các dịch vụ đang hoạt động.
     * @return array
     */
    public function getAllActive(): array
    {
        $stmt = $this->query("SELECT * FROM {$this->table} WHERE HoatDong = 1 ORDER BY TenDichVu");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
