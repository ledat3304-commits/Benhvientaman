<div class="d-flex justify-content-between mb-3">
    <h4 class="mb-0">Danh sách Bác sĩ</h4>
    <a href="/admin/doctors/create" class="btn btn-primary"><i class="fas fa-plus me-1"></i> Thêm Bác sĩ mới</a>
</div>

<div class="card shadow-sm">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Họ Tên</th>
                        <th>Email</th>
                        <th>Chuyên khoa</th>
                        <th class="text-center">Trạng thái</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($doctors)): ?>
                        <tr>
                            <td colspan="5" class="text-center text-muted py-4">Chưa có dữ liệu bác sĩ.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($doctors as $doctor): ?>
                            <tr>
                                <td><?= htmlspecialchars($doctor['HoTen']) ?></td>
                                <td><?= htmlspecialchars($doctor['Email']) ?></td>
                                <td><?= htmlspecialchars($doctor['TenChuyenKhoa'] ?? 'N/A') ?></td>
                                <td class="text-center">
                                    <?php if ($doctor['HoatDong']): ?>
                                        <span class="badge bg-success">Hoạt động</span>
                                    <?php else: ?>
                                        <span class="badge bg-danger">Vô hiệu hóa</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center">
                                    <a href="/admin/doctors/<?= $doctor['BacSiID'] ?>/edit" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>