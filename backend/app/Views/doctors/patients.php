<?php $title = 'Danh sách Bệnh nhân'; ?>

<div class="container mt-4">
    <div class="card shadow-sm">
        <div class="card-header bg-success text-white">
            <h4 class="mb-0"><i class="fas fa-users me-2"></i>Danh sách Bệnh nhân đã khám</h4>
        </div>
        <div class="card-body">
            <p class="text-muted">Dưới đây là danh sách tất cả các bệnh nhân đã có lịch hẹn với bạn.</p>
            
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Họ và Tên</th>
                            <th>Ngày Sinh</th>
                            <th>Giới Tính</th>
                            <th>Số Điện Thoại</th>
                            <th class="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($patients)): ?>
                            <tr>
                                <td colspan="5" class="text-center text-muted py-4">Bạn chưa có bệnh nhân nào.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($patients as $patient): ?>
                                <tr>
                                    <td><?= htmlspecialchars($patient['HoTen']) ?></td>
                                    <td><?= date('d/m/Y', strtotime($patient['NgaySinh'])) ?></td>
                                    <td><?= htmlspecialchars($patient['GioiTinh']) ?></td>
                                    <td><?= htmlspecialchars($patient['SoDienThoai']) ?></td>
                                    <td class="text-center">
                                    <a href="/patients/<?= $patient['BenhNhanID'] ?>/history" class="btn btn-sm btn-info" title="Xem Lịch sử khám">
                                            <i class="fas fa-history"></i> Xem Lịch sử
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
</div>