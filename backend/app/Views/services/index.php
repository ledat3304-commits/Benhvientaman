<div class="container my-5">
    <div class="text-center mb-5">
        <h2 class="text-primary fw-bold text-uppercase">Dịch Vụ Y Tế</h2>
        <p class="text-muted">Các dịch vụ khám chữa bệnh chất lượng cao tại Bệnh viện Tâm An</p>
    </div>

    <div class="row g-4">
        <?php if (!empty($services) && is_array($services)): ?>
            <?php foreach ($services as $service): ?>
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="icon-box rounded-circle bg-primary-subtle p-3 me-3 text-primary">
                                    <i class="fas fa-stethoscope fa-2x"></i>
                                </div>
                                <div>
                                    <h5 class="card-title fw-bold text-dark mb-0">
                                        <?= htmlspecialchars($service['TenDichVu'] ?? 'Dịch vụ') ?>
                                    </h5>
                                </div>
                            </div>
                            <p class="card-text text-muted small">
                                <?= htmlspecialchars($service['MoTa'] ?? 'Cung cấp dịch vụ khám bệnh và chăm sóc sức khỏe toàn diện.') ?>
                            </p>
                        </div>
                        <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center pb-4 px-4">
                            <span class="fw-bold text-primary fs-5">
                                <?= number_format($service['DonGia'] ?? 0, 0, ',', '.') ?> VNĐ
                            </span>
                            <a href="/login" class="btn btn-outline-primary btn-sm rounded-pill px-3">Đăng ký ngay</a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="col-12 text-center py-5">
                <i class="fas fa-file-medical fa-4x text-muted mb-3"></i>
                <p class="text-muted fs-5">Hiện chưa có dữ liệu dịch vụ. Vui lòng quay lại sau!</p>
            </div>
        <?php endif; ?>
    </div>
</div>