<?php $title = 'Danh sách Bác sĩ'; ?>

<div class="container mt-4">
    <div class="text-center mb-4">
        <h1>Gặp gỡ đội ngũ Bác sĩ của chúng tôi</h1>
        <p class="lead">Chọn một bác sĩ để xem lịch và đặt hẹn trực tuyến.</p>
    </div>

    <div class="row">
        <?php if (empty($doctors)): ?>
            <p class="text-center">Chưa có thông tin bác sĩ.</p>
        <?php else: ?>
            <?php foreach ($doctors as $doctor): ?>
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm text-center">
                        <div class="card-body">
                            <i class="fas fa-user-md fa-4x text-primary mb-3"></i>
                            <h5 class="card-title"><?= htmlspecialchars($doctor['HoTen']) ?></h5>
                            <h6 class="card-subtitle mb-2 text-muted"><?= htmlspecialchars($doctor['TenChuyenKhoa'] ?? 'Chưa có chuyên khoa') ?></h6>
                            <p class="card-text"><strong>Kinh nghiệm:</strong> <?= htmlspecialchars($doctor['KinhNghiem'] ?? 'N/A') ?></p>
                            <a href="/appointments/create/<?= $doctor['BacSiID'] ?>" class="btn btn-primary">
                                <i class="fas fa-calendar-plus me-1"></i> Đặt lịch hẹn
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>