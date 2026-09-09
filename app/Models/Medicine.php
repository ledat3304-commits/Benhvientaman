<?php

namespace App\Models;

use PDO;

class Medicine extends BaseModel
{
    protected string $table = 'danhmucthuoc';
    protected string $primaryKey = 'ThuocID';

    /**
     * Lấy tất cả các loại thuốc để hiển thị trong danh sách.
     * @return array
     */
    public function getAll(): array
    {
        $stmt = $this->query("SELECT * FROM {$this->table} ORDER BY TenThuoc");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
