<?php $title = 'Quản lý Lịch hẹn'; ?>

<div class="container mt-4">
    <div class="card shadow-sm">
        <div class="card-header bg-success text-white">
            <h4 class="mb-0"><i class="fas fa-clipboard-list me-2"></i>Danh sách Lịch hẹn</h4>
        </div>
        <div class="card-body">
            <?php if (isset($_SESSION['success_message'])): ?>
                <div class="alert alert-success" role="alert">
                    <?= $_SESSION['success_message']; unset($_SESSION['success_message']); ?>
                </div>
            <?php endif; ?>

            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Bệnh nhân</th>
                            <th>Thời gian khám</th>
                            <th>Lý do khám</th>
                            <th>Trạng thái</th>
                            <th class="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($appointments)): ?>
                            <tr>
                                <td colspan="5" class="text-center text-muted">Chưa có lịch hẹn nào.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($appointments as $apt): ?>
                                <tr>
                                    <td><?= htmlspecialchars($apt['TenBenhNhan']) ?></td>
                                    <td><?= date('d/m/Y H:i', strtotime($apt['ThoiGianKham'])) ?></td>
                                    <td><?= htmlspecialchars($apt['LyDoKham']) ?></td>
                                    <td>
                                        <span class="badge bg-<?= getStatusBadgeClass($apt['TrangThai']) ?>">
                                            <?= htmlspecialchars($apt['TrangThai']) ?>
                                        </span>
                                    </td>
                                    <td class="text-center">
                                        <a href="/appointments/<?= $apt['LichKhamID'] ?>" class="btn btn-sm btn-info" title="Xem chi tiết"><i class="fas fa-eye"></i></a>
                                        <?php if ($apt['TrangThai'] == 'ChoXacNhan'): ?>
                                            <form action="/appointments/<?= $apt['LichKhamID'] ?>/status" method="POST" class="d-inline">
                                                <input type="hidden" name="status" value="DaXacNhan">
                                                <button type="submit" class="btn btn-sm btn-success" title="Xác nhận"><i class="fas fa-check"></i></button>
                                            </form>
                                            <form action="/appointments/<?= $apt['LichKhamID'] ?>/status" method="POST" class="d-inline">
                                                <input type="hidden" name="status" value="DaHuy">
                                                <button type="submit" class="btn btn-sm btn-danger" title="Hủy"><i class="fas fa-times"></i></button>
                                            </form>
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

<?php
// Hàm trợ giúp nhỏ để đổi màu cho trạng thái
function getStatusBadgeClass($status) {
    return match ($status) {
        'DaXacNhan' => 'primary',
        'DaHoanThanh' => 'success',
        'DaHuy' => 'danger',
        default => 'warning',
    };
}
?>