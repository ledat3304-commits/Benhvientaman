<?php

namespace App\Models;

use PDO;

class Doctor extends BaseModel
{
    protected string $table = 'bacsi';
    protected string $primaryKey = 'BacSiID';

    /**
     * Tìm hồ sơ bác sĩ bằng UserID và lấy thông tin liên quan.
     *
     * @param int $userId ID của người dùng trong bảng 'nguoidung'.
     * @return array|false Mảng dữ liệu hồ sơ bác sĩ hoặc false nếu không tìm thấy.
     */
    public function findByUserId(int $userId): array|false
    {
        // JOIN 3 bảng `bacsi`, `nguoidung`, và `chuyenkhoa`
        // để lấy tất cả thông tin cần thiết trong một lần truy vấn.
        $sql = "SELECT 
                    u.UserID, u.HoTen, u.Email, u.SoDienThoai,
                    b.BacSiID, b.MoTa, b.KinhNghiem,
                    c.TenChuyenKhoa
                FROM {$this->table} AS b
                JOIN nguoidung AS u ON b.UserID = u.UserID
                LEFT JOIN chuyenkhoa AS c ON b.ChuyenKhoaID = c.ChuyenKhoaID
                WHERE b.UserID = :userId";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Lấy tất cả các bác sĩ đang hoạt động cùng với tên chuyên khoa.
     * @return array
     */
    public function getAllWithSpecialty(): array
    {
        $sql = "SELECT 
                    bs.BacSiID, bs.MoTa, bs.KinhNghiem,
                    u.HoTen,
                    ck.TenChuyenKhoa
                FROM {$this->table} AS bs
                JOIN nguoidung AS u ON bs.UserID = u.UserID
                LEFT JOIN chuyenkhoa AS ck ON bs.ChuyenKhoaID = ck.ChuyenKhoaID
                WHERE u.HoatDong = 1
                ORDER BY u.HoTen";
        
        $stmt = $this->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Lấy thông tin chi tiết của một bác sĩ (join với user và chuyenkhoa).
     * @param int $doctorId
     * @return array|false
     */
    public function findWithDetails(int $doctorId): array|false
    {
        $sql = "SELECT 
                    bs.BacSiID, bs.MoTa, bs.KinhNghiem,
                    u.HoTen,
                    ck.TenChuyenKhoa
                FROM {$this->table} AS bs
                JOIN nguoidung AS u ON bs.UserID = u.UserID
                LEFT JOIN chuyenkhoa AS ck ON bs.ChuyenKhoaID = ck.ChuyenKhoaID
                WHERE bs.BacSiID = ?";
        $stmt = $this->query($sql, [$doctorId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Lấy tất cả bác sĩ cho trang quản trị, bao gồm thông tin từ bảng nguoidung và chuyenkhoa.
     * @return array
     */
    public function getAllDoctorsForAdmin(): array
    {
        $sql = "SELECT 
                    bs.BacSiID, bs.KinhNghiem,
                    u.HoTen, u.Email, u.SoDienThoai, u.HoatDong,
                    ck.TenChuyenKhoa
                FROM {$this->table} AS bs
                JOIN nguoidung AS u ON bs.UserID = u.UserID
                LEFT JOIN chuyenkhoa AS ck ON bs.ChuyenKhoaID = ck.ChuyenKhoaID
                ORDER BY u.HoTen";
        
        $stmt = $this->query($sql);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Ghi đè phương thức findAll để lấy thông tin bác sĩ kèm tên từ bảng nguoidung.
     * @param string|null $orderBy Tên cột để sắp xếp (ví dụ: 'HoTen').
     * @return array
     */
    public function findAll(string $orderBy = null): array
    {
        $sql = "SELECT 
                    bs.*, 
                    u.HoTen, u.Email 
                FROM {$this->table} AS bs
                JOIN nguoidung AS u ON bs.UserID = u.UserID";

        if ($orderBy === 'HoTen') {
            $sql .= " ORDER BY u.HoTen ASC";
        } elseif ($orderBy) {
            $sql .= " ORDER BY " . $orderBy;
        }

        $stmt = $this->query($sql);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Ghi đè phương thức find để lấy thông tin bác sĩ kèm tên từ bảng nguoidung.
     * @param int $id ID của bác sĩ (BacSiID).
     * @return array|false
     */
    public function find(int $id): array|false 
    {
        $sql = "SELECT 
                    bs.*, 
                    u.HoTen, u.Email, u.SoDienThoai, u.HoatDong
                FROM {$this->table} AS bs
                JOIN nguoidung AS u ON bs.UserID = u.UserID
                WHERE bs.{$this->primaryKey} = ?";
        
        $stmt = $this->query($sql, [$id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
    
}
