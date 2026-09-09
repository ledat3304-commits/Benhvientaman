<?php $title = 'Lịch hẹn của tôi'; ?>

<div class="container mt-4">
    <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Lịch hẹn của tôi</h4>
        </div>
        <div class="card-body">
            <p class="text-muted">Dưới đây là danh sách các lịch hẹn sắp tới và đã qua của bạn.</p>
            
            <?php if (isset($_SESSION['success_message'])): ?>
                <div class="alert alert-success" role="alert"><?= $_SESSION['success_message']; unset($_SESSION['success_message']); ?></div>
            <?php endif; ?>

            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Bác sĩ</th>
                            <th>Thời gian khám</th>
                            <th>Lý do khám</th>
                            <th class="text-center">Trạng thái</th>
                            <th class="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($appointments)): ?>
                            <tr>
                                <td colspan="5" class="text-center text-muted py-4">Bạn chưa có lịch hẹn nào.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($appointments as $apt): ?>
                                <tr>
                                    <td><?= htmlspecialchars($apt['TenBacSi']) ?></td>
                                    <td><?= date('H:i d/m/Y', strtotime($apt['ThoiGianKham'])) ?></td>
                                    <td><?= htmlspecialchars($apt['LyDoKham']) ?></td>
                                    <td class="text-center">
                                        <?php
                                            $statusClasses = [
                                                'ChoXacNhan' => 'bg-warning text-dark',
                                                'DaXacNhan' => 'bg-info',
                                                'DaHoanThanh' => 'bg-success',
                                                'DaHuy' => 'bg-danger',
                                            ];
                                            $class = $statusClasses[$apt['TrangThai']] ?? 'bg-secondary';
                                        ?>
                                        <span class="badge <?= $class ?>"><?= htmlspecialchars($apt['TrangThai']) ?></span>
                                    </td>
                                    <td class="text-center">
                                        <?php if ($apt['TrangThai'] === 'DaHoanThanh'): ?>
                                            <a href="/appointments/<?= $apt['LichKhamID'] ?>" class="btn btn-sm btn-outline-primary">Xem chi tiết</a>
                                        <?php elseif (in_array($apt['TrangThai'], ['ChoXacNhan', 'DaXacNhan'])): ?>
                                            <a href="/appointments/<?= $apt['LichKhamID'] ?>/cancel" class="btn btn-sm btn-outline-danger" onclick="return confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')">Hủy lịch</a>
                                        <?php endif; ?>
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