<div class="container-fluid">
    <!-- Header Chào mừng -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-1">Chào mừng Bác sĩ, <?= htmlspecialchars($user['HoTen'] ?? 'Lê Đạt') ?>!</h3>
            <p class="text-muted mb-0">Chúc bạn một ngày làm việc hiệu quả tại Bệnh viện Tâm An.</p>
        </div>
        <div>
            <a href="/doctor/schedules" class="btn btn-outline-primary me-2">
                <i class="fas fa-calendar-alt me-1"></i> Quản lý lịch trực
            </a>
            <a href="/logout" class="btn btn-danger">
                <i class="fas fa-sign-out-alt me-1"></i> Đăng xuất
            </a>
        </div>
    </div>

    <!-- Thẻ Thống Kê Nhanh -->
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-4 border-primary">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Lịch hẹn hôm nay</span>
                        <h3 class="fw-bold text-primary mb-0 mt-1"><?= count($appointments ?? []) ?></h3>
                    </div>
                    <div class="rounded-circle bg-primary-subtle p-3 text-primary">
                        <i class="fas fa-calendar-check fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-4 border-success">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Bệnh nhân chờ khám</span>
                        <h3 class="fw-bold text-success mb-0 mt-1">
                            <?php 
                                $pending = array_filter($appointments ?? [], function($item) {
                                    return ($item['TrangThai'] ?? '') === 'ChoXacNhan' || ($item['TrangThai'] ?? '') === 'DaXacNhan';
                                });
                                echo count($pending);
                            ?>
                        </h3>
                    </div>
                    <div class="rounded-circle bg-success-subtle p-3 text-success">
                        <i class="fas fa-user-clock fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-4 border-info">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-bold">Ca khám hoàn thành</span>
                        <h3 class="fw-bold text-info mb-0 mt-1">
                            <?php 
                                $completed = array_filter($appointments ?? [], function($item) {
                                    return ($item['TrangThai'] ?? '') === 'DaHoanThanh';
                                });
                                echo count($completed);
                            ?>
                        </h3>
                    </div>
                    <div class="rounded-circle bg-info-subtle p-3 text-info">
                        <i class="fas fa-check-circle fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Danh sách Lịch hẹn khám hôm nay -->
    <div class="card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-dark mb-0"><i class="fas fa-list-alt me-2 text-primary"></i>Danh Sách Khám Hôm Nay</h5>
            <a href="/doctor/appointments" class="btn btn-sm btn-link text-decoration-none">Xem tất cả lịch hẹn &rarr;</a>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-3">Bệnh Nhân</th>
                            <th>Giờ Khám</th>
                            <th>Lý Do Khám</th>
                            <th>Trạng Thái</th>
                            <th class="text-end pe-3">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($appointments)): ?>
                            <?php foreach ($appointments as $app): ?>
                                <tr>
                                    <td class="ps-3 fw-bold text-dark">
                                        <?= htmlspecialchars($app['TenBenhNhan'] ?? 'Bệnh nhân') ?>
                                    </td>
                                    <td>
                                        <i class="far fa-clock text-muted me-1"></i>
                                        <?= date('H:i', strtotime($app['ThoiGianKham'] ?? 'now')) ?>
                                    </td>
                                    <td><?= htmlspecialchars($app['GhiChu'] ?? $app['LyDoKham'] ?? 'Khám định kỳ') ?></td>
                                    <td>
                                        <?php if (($app['TrangThai'] ?? '') === 'DaHoanThanh'): ?>
                                            <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">Đã hoàn thành</span>
                                        <?php else: ?>
                                            <span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-1">Chờ khám</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end pe-3">
                                        <a href="/doctor/appointments" class="btn btn-sm btn-outline-primary rounded-pill">
                                            <i class="fas fa-edit me-1"></i> Cập nhật
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="5" class="text-center py-4 text-muted">
                                    <i class="fas fa-calendar-day fa-3x mb-2 d-block text-black-50"></i>
                                    Không có lịch hẹn khám nào được ghi nhận trong hôm nay.
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>