<div class="d-flex justify-content-between mb-3">
    <h4 class="mb-0">Danh mục Thuốc</h4>
    <a href="/admin/medicines/create" class="btn btn-primary"><i class="fas fa-plus me-1"></i> Thêm Thuốc</a>
</div>

<div class="card shadow-sm">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Tên Thuốc</th>
                        <th>Hoạt chất</th>
                        <th>Đơn vị tính</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($medicines)): ?>
                        <tr><td colspan="4" class="text-center text-muted py-4">Chưa có thuốc nào trong danh mục.</td></tr>
                    <?php else: ?>
                        <?php foreach ($medicines as $medicine): ?>
                            <tr>
                                <td><?= htmlspecialchars($medicine['TenThuoc']) ?></td>
                                <td><?= htmlspecialchars($medicine['HoatChat']) ?></td>
                                <td><?= htmlspecialchars($medicine['DonViTinh']) ?></td>
                                <td class="text-center">
                                    <a href="/admin/medicines/<?= $medicine['ThuocID'] ?>/edit" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa"><i class="fas fa-edit"></i></a>
                                    <form action="/admin/medicines/<?= $medicine['ThuocID'] ?>/delete" method="POST" class="d-inline" onsubmit="return confirm('Bạn có chắc chắn muốn xóa thuốc này?');">
                                        <button type="submit" class="btn btn-sm btn-outline-danger" title="Xóa"><i class="fas fa-trash"></i></button>
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