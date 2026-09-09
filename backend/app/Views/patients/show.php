<div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold text-dark mb-0">Hồ Sơ Chi Tiết Bệnh Nhân</h3>
        <a href="/admin/patients" class="btn btn-outline-secondary rounded-pill px-3">
            <i class="fas fa-arrow-left me-1"></i> Quay lại
        </a>
    </div>

    <div class="row g-4">
        <!-- Thông tin cá nhân -->
        <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-3 p-4 bg-white">
                <div class="text-center mb-3">
                    <div class="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style="width: 80px; height: 80px;">
                        <i class="fas fa-user-injured fa-3x"></i>
                    </div>
                    <h5 class="fw-bold text-dark mb-1"><?= htmlspecialchars($patient['HoTen'] ?? 'Bệnh nhân') ?></h5>
                    <span class="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3">Mã BN: #<?= htmlspecialchars($patient['BenhNhanID'] ?? $patient['UserID'] ?? $id) ?></span>
                </div>
                <hr>
                <div class="vstack gap-2 small">
                    <div><strong>Ngày sinh:</strong> <?= !empty($patient['NgaySinh']) ? date('d/m/Y', strtotime($patient['NgaySinh'])) : 'Chưa cập nhật' ?></div>
                    <div><strong>Giới tính:</strong> <?= htmlspecialchars($patient['GioiTinh'] ?? 'Nam') ?></div>
                    <div><strong>Số điện thoại:</strong> <?= htmlspecialchars($patient['SoDienThoai'] ?? $patient['SDT'] ?? 'Chưa có') ?></div>
                    <div><strong>Email:</strong> <?= htmlspecialchars($patient['Email'] ?? 'Chưa có') ?></div>
                    <div><strong>Địa chỉ:</strong> <?= htmlspecialchars($patient['DiaChi'] ?? 'Chưa cập nhật') ?></div>
                </div>
            </div>
        </div>

        <!-- Lịch sử khám bệnh -->
        <div class="col-md-8">
            <div class="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                <div class="card-header bg-white py-3">
                    <h5 class="fw-bold text-dark mb-0"><i class="fas fa-history text-primary me-2"></i>Lịch Sử Đăng Ký Khám</h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-3">Thời Gian</th>
                                    <th>Bác Sĩ Khám</th>
                                    <th>Lý Do / Ghi Chú</th>
                                    <th class="pe-3">Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (!empty($appointments)): ?>
                                    <?php foreach ($appointments as $app): ?>
                                        <tr>
                                            <td class="ps-3 fw-medium"><?= date('d/m/Y H:i', strtotime($app['ThoiGianKham'] ?? 'now')) ?></td>
                                            <td class="text-primary"><?= htmlspecialchars($app['TenBacSi'] ?? 'Lê Đạt') ?></td>
                                            <td><?= htmlspecialchars($app['GhiChu'] ?? $app['LyDoKham'] ?? 'Khám định kỳ') ?></td>
                                            <td class="pe-3">
                                                <?php if (($app['TrangThai'] ?? '') === 'DaHoanThanh'): ?>
                                                    <span class="badge bg-success-subtle text-success border rounded-pill px-3 py-1">Đã Hoàn Thành</span>
                                                <?php else: ?>
                                                    <span class="badge bg-warning-subtle text-warning border rounded-pill px-3 py-1">Chờ Xác Nhận</span>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="4" class="text-center py-4 text-muted">Bệnh nhân chưa có lịch sử khám bệnh.</td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>