<div class="d-flex justify-content-between mb-3">
    <h4 class="mb-0">Danh sách Chuyên khoa</h4>
    <a href="/admin/specialties/create" class="btn btn-primary"><i class="fas fa-plus me-1"></i> Thêm Chuyên khoa</a>
</div>

<div class="card shadow-sm">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Tên Chuyên khoa</th>
                        <th>Mô tả</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($specialties)): ?>
                        <tr><td colspan="3" class="text-center text-muted py-4">Chưa có chuyên khoa nào.</td></tr>
                    <?php else: ?>
                        <?php foreach ($specialties as $specialty): ?>
                            <tr>
                                <td><?= htmlspecialchars($specialty['TenChuyenKhoa']) ?></td>
                                <td><?= htmlspecialchars(substr($specialty['MoTa'], 0, 100)) . '...' ?></td>
                                <td class="text-center">
                                    <a href="/admin/specialties/<?= $specialty['ChuyenKhoaID'] ?>/edit" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="/admin/specialties/<?= $specialty['ChuyenKhoaID'] ?>/delete" method="POST" class="d-inline" onsubmit="return confirm('Bạn có chắc chắn muốn xóa chuyên khoa này? Việc này có thể ảnh hưởng đến dữ liệu bác sĩ liên quan.');">
                                        <button type="submit" class="btn btn-sm btn-outline-danger" title="Xóa">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>