<div class="d-flex justify-content-between mb-3">
    <h4 class="mb-0">Danh sách Dịch vụ</h4>
    <a href="/admin/services/create" class="btn btn-primary"><i class="fas fa-plus me-1"></i> Thêm Dịch vụ</a>
</div>

<div class="card shadow-sm">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Tên Dịch vụ</th>
                        <th class="text-end">Đơn giá</th>
                        <th class="text-center">Trạng thái</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($services)): ?>
                        <tr><td colspan="4" class="text-center text-muted py-4">Chưa có dịch vụ nào.</td></tr>
                    <?php else: ?>
                        <?php foreach ($services as $service): ?>
                            <tr>
                                <td><?= htmlspecialchars($service['TenDichVu']) ?></td>
                                <td class="text-end"><?= number_format($service['DonGia'], 0, ',', '.') ?> VNĐ</td>
                                <td class="text-center">
                                    <?php if ($service['HoatDong']): ?>
                                        <span class="badge bg-success">Hoạt động</span>
                                    <?php else: ?>
                                        <span class="badge bg-secondary">Không hoạt động</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center">
                                    <a href="/admin/services/<?= $service['DichVuID'] ?>/edit" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa"><i class="fas fa-edit"></i></a>
                                    <form action="/admin/services/<?= $service['DichVuID'] ?>/delete" method="POST" class="d-inline" onsubmit="return confirm('Bạn có chắc chắn muốn xóa dịch vụ này?');">
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