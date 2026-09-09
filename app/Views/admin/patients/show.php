<a href="/admin/patients" class="btn btn-secondary mb-3"><i class="fas fa-arrow-left me-2"></i>Quay lại danh sách</a>

<div class="row">
    <!-- Cột thông tin cá nhân -->
    <div class="col-lg-4">
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-info text-white">
                <h5 class="mb-0"><i class="fas fa-user-circle me-2"></i>Thông tin Bệnh nhân</h5>
            </div>
            <div class="card-body">
                <p><strong>Họ tên:</strong> <?= htmlspecialchars($patient['HoTen']) ?></p>
                <p><strong>Ngày sinh:</strong> <?= $patient['NgaySinh'] ? date('d/m/Y', strtotime($patient['NgaySinh'])) : 'Chưa cập nhật' ?></p>
                <p><strong>Giới tính:</strong> <?= htmlspecialchars($patient['GioiTinh'] ?? 'Chưa cập nhật') ?></p>
                <p><strong>Số điện thoại:</strong> <?= htmlspecialchars($patient['SoDienThoai']) ?></p>
                <p><strong>Email:</strong> <?= htmlspecialchars($patient['Email'] ?? 'Không có') ?></p>
                <p><strong>Địa chỉ:</strong> <?= htmlspecialchars($patient['DiaChi'] ?? 'Chưa cập nhật') ?></p>
            </div>
        </div>
    </div>

    <!-- Cột lịch sử khám -->
    <div class="col-lg-8">
        <div class="card shadow-sm">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-history me-2"></i>Lịch sử Khám bệnh</h5>
            </div>
            <div class="card-body">
                <?php if (empty($appointments)): ?>
                    <p class="text-muted text-center">Bệnh nhân này chưa có lịch sử khám bệnh.</p>
                <?php else: ?>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Ngày khám</th>
                                    <th>Bác sĩ</th>
                                    <th>Lý do</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($appointments as $apt): ?>
                                    <tr>
                                        <td><?= date('d/m/Y H:i', strtotime($apt['ThoiGianKham'])) ?></td>
                                        <td><?= htmlspecialchars($apt['TenBacSi']) ?></td>
                                        <td><?= htmlspecialchars($apt['LyDoKham']) ?></td>
                                        <td><span class="badge bg-success"><?= htmlspecialchars($apt['TrangThai']) ?></span></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>