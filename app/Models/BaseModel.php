<?php

namespace App\Models;

use Core\Database;
use PDO;
use PDOStatement;

/**
 * Class BaseModel
 * Lớp model cơ sở, cung cấp các phương thức tương tác CSDL chung.
 */
abstract class BaseModel
{
    /**
     * @var PDO Đối tượng kết nối PDO.
     */
    protected PDO $pdo;

    /**
     * @var string Tên bảng trong CSDL. Phải được định nghĩa ở lớp con.
     */
    protected string $table;

    /**
     * @var string Tên khóa chính của bảng. Mặc định là 'id'.
     */
    protected string $primaryKey = 'id';

    /**
     * Khởi tạo model và lấy kết nối CSDL.
     */
    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * Lấy tất cả các bản ghi từ bảng.
     *
     * @return array Mảng các bản ghi.
     */
    public function all(): array
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Tìm một bản ghi bằng khóa chính.
     *
     * @param int $id Giá trị của khóa chính.
     * @return array|false Mảng dữ liệu của bản ghi hoặc false nếu không tìm thấy.
     */
    public function find(int $id): array|false
    {
        $stmt = $this->query("SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?", [$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Tạo một bản ghi mới.
     *
     * @param array $data Mảng dữ liệu dạng ['column' => 'value'].
     * @return int|false ID của bản ghi mới được tạo hoặc false nếu thất bại.
     */
    public function create(array $data): int|false
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = rtrim(str_repeat('?, ', count($data)), ', ');

        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";

        $this->query($sql, array_values($data));

        return (int)$this->pdo->lastInsertId();
    }

    /**
     * Cập nhật một bản ghi dựa trên khóa chính.
     *
     * @param int $id Giá trị của khóa chính.
     * @param array $data Mảng dữ liệu cần cập nhật.
     * @return bool True nếu thành công, false nếu thất bại.
     */
    public function update(int $id, array $data): bool
    {
        $setClauses = [];
        foreach (array_keys($data) as $column) {
            $setClauses[] = "{$column} = ?";
        }
        $setClause = implode(', ', $setClauses);

        $sql = "UPDATE {$this->table} SET {$setClause} WHERE {$this->primaryKey} = ?";

        $values = array_values($data);
        $values[] = $id;

        $stmt = $this->query($sql, $values);

        return $stmt->rowCount() > 0;
    }
    
    /**
     * Tìm tất cả các bản ghi dựa trên một cột cụ thể.
     *
     * @param string $column Tên cột để tìm kiếm.
     * @param mixed $value Giá trị cần tìm.
     * @param string $orderBy Mệnh đề sắp xếp ('created_at DESC').
     * @return array Mảng các bản ghi tìm thấy.
     */
    public function findAllBy(string $column, $value, string $orderBy = ''): array
    {
        // Lưu ý: Để đảm bảo an toàn, $column và $orderBy không nên đến trực tiếp từ người dùng.
        $sql = "SELECT * FROM {$this->table} WHERE {$column} = ?";
        
        if ($orderBy) {
            // Thêm mệnh đề ORDER BY vào câu lệnh SQL
            $sql .= " ORDER BY {$orderBy}";
        }
        
        $stmt = $this->query($sql, [$value]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Lấy bản ghi đầu tiên khớp với điều kiện.
     *
     * @param string $column
     * @param mixed $value
     * @return array|false
     */
    public function first(string $column, $value): array|false
    {
        $stmt = $this->query("SELECT * FROM {$this->table} WHERE {$column} = ? LIMIT 1", [$value]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Phương thức trợ giúp để thực thi câu lệnh SQL.
     *
     * @param string $sql Câu lệnh SQL có các placeholder (?).
     * @param array $params Mảng các tham số để bind vào câu lệnh.
     * @return PDOStatement|false Đối tượng PDOStatement hoặc false nếu có lỗi.
     */
    protected function query(string $sql, array $params = []): PDOStatement|false
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Đếm tổng số bản ghi trong bảng.
     * @return int
     */
    public function countAll(): int
    {
        $stmt = $this->query("SELECT COUNT(*) FROM {$this->table}");
        return (int) $stmt->fetchColumn();
    }

    /**
     * Đếm số bản ghi dựa trên một điều kiện.
     * @param string $column
     * @param mixed $value
     * @return int
     */
    public function countWhere(string $column, $value): int
    {
        $sql = "SELECT COUNT(*) FROM {$this->table} WHERE {$column} = ?";
        $stmt = $this->query($sql, [$value]);
        return (int) $stmt->fetchColumn();
    }

    /**
     * Lấy tất cả các bản ghi từ bảng.
     * @param string|null $orderBy
     * @return array
     */
    public function findAll(string $orderBy = null): array
    {
        $sql = "SELECT * FROM {$this->table}";
        if ($orderBy) {
            $sql .= " ORDER BY " . $orderBy;
        }
        $stmt = $this->query($sql);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Xóa một bản ghi khỏi bảng dựa trên khóa chính.
     * @param int $id
     * @return int Số hàng bị ảnh hưởng.
     */
    public function delete(int $id): int
    {
        $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
        $stmt = $this->query($sql, [$id]);
        return $stmt->rowCount();
    }
    
}
