<div class="container py-4">
    <div class="card border-0 shadow-sm rounded-4">
        <div class="card-header bg-primary text-white p-3">
            <h5 class="fw-bold mb-0"><i class="fas fa-user-circle me-2"></i>HỒ SƠ CÁ NHÂN</h5>
        </div>
        <div class="card-body p-4">
            <?php if (isset($_SESSION['success_message'])): ?>
                <div class="alert alert-success alert-dismissible fade show rounded-3 small mb-4">
                    <?= $_SESSION['success_message'] ?>
                    <?php unset($_SESSION['success_message']); ?>
                </div>
            <?php endif; ?>

            <form action="/patient/profile/update" method="POST">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Họ và Tên</label>
                        <input type="text" name="HoTen" class="form-control" value="<?= htmlspecialchars($patient['HoTen'] ?? '') ?>" required>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-bold">Số Điện Thoại</label>
                        <input type="text" name="SoDienThoai" class="form-control" value="<?= htmlspecialchars($patient['SoDienThoai'] ?? $patient['SDT'] ?? '') ?>">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-bold">Ngày Sinh</label>
                        <input type="date" name="NgaySinh" class="form-control" value="<?= htmlspecialchars($patient['NgaySinh'] ?? '') ?>">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-bold">Giới Tính</label>
                        <select name="GioiTinh" class="form-select">
                            <option value="Nam" <?= (($patient['GioiTinh'] ?? '') === 'Nam') ? 'selected' : '' ?>>Nam</option>
                            <option value="Nữ" <?= (($patient['GioiTinh'] ?? '') === 'Nữ') ? 'selected' : '' ?>>Nữ</option>
                        </select>
                    </div>

                    <div class="col-12">
                        <label class="form-label fw-bold">Địa Chỉ</label>
                        <input type="text" name="DiaChi" class="form-control" value="<?= htmlspecialchars($patient['DiaChi'] ?? '') ?>" placeholder="Nhập địa chỉ">
                    </div>

                    <div class="col-12 mt-4 text-end">
                        <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">
                            <i class="fas fa-save me-1"></i> Cập Nhật Hồ Sơ
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>