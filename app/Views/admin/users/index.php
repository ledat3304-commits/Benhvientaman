<div class="container-fluid px-4 mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">Quản lý Tài khoản</h2>
    </div>

    <div class="card shadow mb-4">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Họ và Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($users)): ?>
                            <?php foreach ($users as $user): ?>
                                <tr>
                                    <td><?= htmlspecialchars($user['UserID'] ?? $user['id'] ?? '') ?></td>
                                    <td><?= htmlspecialchars($user['HoTen'] ?? $user['name'] ?? '') ?></td>
                                    <td><?= htmlspecialchars($user['Email'] ?? $user['email'] ?? '') ?></td>
                                    <td><?= htmlspecialchars($user['SoDienThoai'] ?? $user['phone'] ?? 'Chưa cập nhật') ?></td>
                                    <td>
                                        <span class="badge bg-<?= ($user['VaiTro'] ?? '') === 'Admin' || ($user['VaiTro'] ?? '') === 'QuanTriVien' ? 'danger' : (($user['VaiTro'] ?? '') === 'BacSi' ? 'info' : 'primary') ?>">
                                            <?= htmlspecialchars($user['VaiTro'] ?? 'BenhNhan') ?>
                                        </span>
                                    </td>
                                    <td><?= htmlspecialchars($user['NgayTao'] ?? $user['created_at'] ?? 'N/A') ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="6" class="text-center">Không có dữ liệu người dùng.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>