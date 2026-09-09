<div class="card shadow-sm">
    <div class="card-header">
        <h4 class="mb-0">Bộ lọc Lịch hẹn</h4>
        <form action="/admin/appointments" method="GET" class="mt-3">
            <div class="row g-3 align-items-end">
                <div class="col-md-3">
                    <label for="status" class="form-label">Trạng thái</label>
                    <select name="status" id="status" class="form-select">
                        <option value="">Tất cả</option>
                        <option value="ChoXacNhan" <?= ($filters['status'] ?? '') == 'ChoXacNhan' ? 'selected' : '' ?>>Chờ xác nhận</option>
                        <option value="DaXacNhan" <?= ($filters['status'] ?? '') == 'DaXacNhan' ? 'selected' : '' ?>>Đã xác nhận</option>
                        <option value="DaHoanThanh" <?= ($filters['status'] ?? '') == 'DaHoanThanh' ? 'selected' : '' ?>>Đã hoàn thành</option>
                        <option value="DaHuy" <?= ($filters['status'] ?? '') == 'DaHuy' ? 'selected' : '' ?>>Đã hủy</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="doctor_id" class="form-label">Bác sĩ</label>
                    <select name="doctor_id" id="doctor_id" class="form-select">
                        <option value="">Tất cả</option>
                        <?php foreach ($doctors as $doctor): ?>
                            <option value="<?= $doctor['BacSiID'] ?>" <?= ($filters['doctor_id'] ?? '') == $doctor['BacSiID'] ? 'selected' : '' ?>><?= htmlspecialchars($doctor['HoTen']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="date" class="form-label">Ngày khám</label>
                    <input type="date" name="date" id="date" class="form-control" value="<?= htmlspecialchars($filters['date'] ?? '') ?>">
                </div>
                <div class="col-md-3">
                    <button type="submit" class="btn btn-primary w-100">Lọc</button>
                    <a href="/admin/appointments" class="btn btn-secondary w-100 mt-2">Xóa bộ lọc</a>
                </div>
            </div>
        </form>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Bệnh nhân</th>
                        <th>Bác sĩ</th>
                        <th>Thời gian khám</th>
                        <th class="text-center">Trạng thái</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($appointments)): ?>
                        <tr><td colspan="5" class="text-center text-muted py-4">Không có lịch hẹn nào phù hợp.</td></tr>
                    <?php else: ?>
                        <?php foreach ($appointments as $apt): ?>
                            <tr>
                                <td><?= htmlspecialchars($apt['TenBenhNhan']) ?></td>
                                <td><?= htmlspecialchars($apt['TenBacSi']) ?></td>
                                <td><?= date('H:i d/m/Y', strtotime($apt['ThoiGianKham'])) ?></td>
                                <td class="text-center"><span class="badge bg-info"><?= htmlspecialchars($apt['TrangThai']) ?></span></td>
                                <td class="text-center">
                                    <?php if ($apt['TrangThai'] == 'ChoXacNhan'): ?>
                                        <form action="/admin/appointments/<?= $apt['LichKhamID'] ?>/status" method="POST" class="d-inline">
                                            <input type="hidden" name="status" value="DaXacNhan">
                                            <button type="submit" class="btn btn-sm btn-success" title="Xác nhận">Xác nhận</button>
                                        </form>
                                        <form action="/admin/appointments/<?= $apt['LichKhamID'] ?>/status" method="POST" class="d-inline">
                                            <input type="hidden" name="status" value="DaHuy">
                                            <button type="submit" class="btn btn-sm btn-danger" title="Hủy" onclick="return confirm('Bạn chắc chắn muốn hủy lịch này?')">Hủy</button>
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