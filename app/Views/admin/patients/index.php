<div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Danh sách Bệnh nhân</h4>
        <form action="/admin/patients" method="GET" class="d-flex">
            <input type="text" class="form-control me-2" name="search" placeholder="Tìm theo tên, SĐT, email..." value="<?= htmlspecialchars($searchTerm) ?>">
            <button type="submit" class="btn btn-primary">Tìm</button>
        </form>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Họ Tên</th>
                        <th>Ngày Sinh</th>
                        <th>Số Điện Thoại</th>
                        <th>Email</th>
                        <th>Ngày tạo</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($patients)): ?>
                        <tr>
                            <td colspan="6" class="text-center text-muted py-4">Không tìm thấy bệnh nhân nào.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($patients as $patient): ?>
                            <tr>
                                <td><?= htmlspecialchars($patient['HoTen']) ?></td>
                                <td><?= $patient['NgaySinh'] ? date('d/m/Y', strtotime($patient['NgaySinh'])) : 'N/A' ?></td>
                                <td><?= htmlspecialchars($patient['SoDienThoai']) ?></td>
                                <td><?= htmlspecialchars($patient['Email'] ?? 'N/A') ?></td>
                                <td><?= date('d/m/Y', strtotime($patient['NgayTaoHoSo'])) ?></td>
                                <td class="text-center">
                                    <a href="/admin/patients/<?= $patient['BenhNhanID'] ?>" class="btn btn-sm btn-outline-info" title="Xem chi tiết">
                                        <i class="fas fa-eye"></i>
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