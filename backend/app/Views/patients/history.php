<?php $title = htmlspecialchars($title); ?>

<div class="container mt-4">
    <!-- Thông tin bệnh nhân -->
    <div class="card shadow-sm mb-4">
        <div class="card-header bg-info text-white">
            <h4 class="mb-0"><i class="fas fa-user-injured me-2"></i>Hồ sơ Bệnh nhân</h4>
        </div>
        <div class="card-body">
            <h5><?= htmlspecialchars($patient['HoTen']) ?></h5>
            <p><strong>Ngày sinh:</strong> <?= date('d/m/Y', strtotime($patient['NgaySinh'])) ?></p>
            <p><strong>Giới tính:</strong> <?= htmlspecialchars($patient['GioiTinh']) ?></p>
            <p><strong>Số điện thoại:</strong> <?= htmlspecialchars($patient['SoDienThoai']) ?></p>
        </div>
    </div>

    <!-- Lịch sử các lần khám -->
    <h3 class="mb-3">Lịch sử Khám bệnh</h3>
    <?php if (empty($appointments)): ?>
        <p class="text-muted">Bệnh nhân này chưa có lịch sử khám bệnh.</p>
    <?php else: ?>
        <div class="accordion" id="historyAccordion">
            <?php foreach ($appointments as $index => $apt): ?>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-<?= $apt['LichKhamID'] ?>">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-<?= $apt['LichKhamID'] ?>">
                            <strong>Lần khám ngày: <?= date('d/m/Y H:i', strtotime($apt['ThoiGianKham'])) ?></strong>
                            <span class="ms-auto me-3 badge bg-success"><?= htmlspecialchars($apt['TrangThai']) ?></span>
                        </button>
                    </h2>
                    <div id="collapse-<?= $apt['LichKhamID'] ?>" class="accordion-collapse collapse" data-bs-parent="#historyAccordion">
                        <div class="accordion-body">
                            <p><strong>Lý do khám:</strong> <?= htmlspecialchars($apt['LyDoKham']) ?></p>
                            <p><strong>Chẩn đoán:</strong> <?= htmlspecialchars($apt['ChuanDoan'] ?? 'Chưa có') ?></p>
                            <a href="/appointments/<?= $apt['LichKhamID'] ?>" class="btn btn-sm btn-outline-primary">Xem chi tiết lần khám này</a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>