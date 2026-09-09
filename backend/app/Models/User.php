<?php

namespace App\Models;

use PDO;

class User extends BaseModel
{
    protected string $table = 'nguoidung';

    /**
     * Lấy danh sách tất cả người dùng.
     * @return array
     */
    public function all(): array
    {
        $stmt = $this->query("SELECT * FROM {$this->table} ORDER BY UserID DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Tạo một người dùng mới.
     * @param array $data
     * @return int|false Trả về UserID mới tạo hoặc false nếu thất bại.
     */
    public function create(array $data): int|false
    {
        $sql = "INSERT INTO {$this->table} (HoTen, Email, SoDienThoai, MatKhau, VaiTro) VALUES (?, ?, ?, ?, ?)";
        $result = $this->query($sql, [
            $data['HoTen'] ?? '',
            $data['Email'] ?? '',
            $data['SoDienThoai'] ?? '',
            $data['MatKhau'] ?? '',
            $data['VaiTro'] ?? 'BenhNhan'
        ]);

        if ($result) {
            return (int)$this->pdo->lastInsertId();
        }

        return false;
    }

    /**
     * Tìm một người dùng dựa trên địa chỉ email.
     *
     * @param string $email Địa chỉ email cần tìm.
     * @return array|false Trả về mảng thông tin người dùng nếu tìm thấy, ngược lại trả về false.
     */
    public function findByEmail(string $email): array|false
    {
        $stmt = $this->query("SELECT * FROM {$this->table} WHERE Email = ?", [$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Tìm người dùng bằng email hoặc số điện thoại.
     * @param string $identifier Email hoặc SĐT
     * @return array|false
     */
    public function findByIdentifier(string $identifier)
    {
        $sql = "SELECT * FROM {$this->table} WHERE Email = ? OR SoDienThoai = ?";
        $stmt = $this->query($sql, [$identifier, $identifier]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Cập nhật mật khẩu cho người dùng (Hỗ trợ chuyển đổi tự động sang BCRYPT Hash).
     * @param int $userId
     * @param string $hashedPassword
     * @return bool
     */
    public function updatePassword(int $userId, string $hashedPassword): bool
    {
        $sql = "UPDATE {$this->table} SET MatKhau = ? WHERE UserID = ?";
        $stmt = $this->query($sql, [$hashedPassword, $userId]);
        return $stmt !== false;
    }

    /**
     * Đếm số lượng người dùng theo vai trò.
     * @param string $role
     * @return int
     */
    public function countByRole(string $role): int
    {
        return $this->countWhere('VaiTro', $role);
    }

    /**
     * Tạo token ghi nhớ đăng nhập.
     */
    public function createAuthToken(int $userId, string $selector, string $validatorHash, string $expiresAt): void
    {
        // Xóa các token cũ của user này để tránh rác
        $this->query("DELETE FROM auth_tokens WHERE UserID = ?", [$userId]);
        $sql = "INSERT INTO auth_tokens (UserID, Selector, ValidatorHash, ExpiresAt) VALUES (?, ?, ?, ?)";
        $this->query($sql, [$userId, $selector, $validatorHash, $expiresAt]);
    }

    /**
     * Tìm người dùng dựa trên token "Ghi nhớ".
     */
    public function findUserByToken(string $selector, string $validator)
    {
        $sql = "SELECT * FROM auth_tokens WHERE Selector = ? AND ExpiresAt >= NOW()";
        $stmt = $this->query($sql, [$selector]);
        $token = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($token && password_verify($validator, $token['ValidatorHash'])) {
            // Token hợp lệ, trả về thông tin người dùng
            return $this->find($token['UserID']);
        }

        // Token không hợp lệ hoặc hết hạn -> xóa token
        if ($token) {
            $this->query("DELETE FROM auth_tokens WHERE TokenID = ?", [$token['TokenID']]);
        }
        
        return false;
    }

    /**
     * Xóa token "Ghi nhớ" bằng selector.
     */
    public function deleteAuthTokenBySelector(string $selector): void
    {
        $this->query("DELETE FROM auth_tokens WHERE Selector = ?", [$selector]);
    }
}