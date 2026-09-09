<div class="container my-5">
    <div class="text-center mb-5">
        <h2 class="text-primary fw-bold text-uppercase">Đội Ngũ Bác Sĩ</h2>
        <p class="text-muted">Đội ngũ chuyên gia, bác sĩ giàu kinh nghiệm tại Bệnh viện Tâm An</p>
    </div>

    <div class="row g-4">
        <?php if (!empty($doctors) && is_array($doctors)): ?>
            <?php foreach ($doctors as $doctor): ?>
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                        <div class="card-body text-center p-4">
                            <div class="avatar-box mb-3 mx-auto rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 90px; height: 90px;">
                                <i class="fas fa-user-md fa-3x text-primary"></i>
                            </div>
                            <h5 class="card-title fw-bold text-dark mb-2">
                                <?= htmlspecialchars($doctor['HoTen'] ?? 'Bác sĩ') ?>
                            </h5>
                            <span class="badge bg-primary-subtle text-primary mb-3 px-3 py-2 rounded-pill">
                                <?= htmlspecialchars($doctor['TenChuyenKhoa'] ?? 'Chuyên khoa') ?>
                            </span>
                            <p class="card-text text-secondary small text-start mt-2">
                                <i class="fas fa-briefcase me-1 text-primary"></i> 
                                <strong>Kinh nghiệm:</strong> <?= htmlspecialchars($doctor['KinhNghiem'] ?? 'Đang cập nhật') ?>
                            </p>
                            <?php if (!empty($doctor['MoTa'])): ?>
                                <p class="card-text text-muted small text-start">
                                    <i class="fas fa-info-circle me-1 text-primary"></i> 
                                    <?= htmlspecialchars($doctor['MoTa']) ?>
                                </p>
                            <?php endif; ?>
                        </div>
                        <div class="card-footer bg-white border-0 text-center pb-4">
                            <a href="/login" class="btn btn-outline-primary btn-sm px-4 rounded-pill">Đặt lịch khám</a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="col-12 text-center py-5">
                <i class="fas fa-user-nurse fa-4x text-muted mb-3"></i>
                <p class="text-muted fs-5">Hiện chưa có thông tin bác sĩ nào trong hệ thống.</p>
            </div>
        <?php endif; ?>
    </div>
</div>