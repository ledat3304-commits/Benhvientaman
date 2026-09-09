<div class="card shadow-sm">
    <div class="card-header"><h4 class="mb-0">Chỉnh sửa Dịch vụ</h4></div>
    <div class="card-body">
        <form action="/admin/services/<?= $service['DichVuID'] ?>" method="POST">
            <div class="mb-3">
                <label for="TenDichVu" class="form-label">Tên Dịch vụ</label>
                <input type="text" class="form-control" id="TenDichVu" name="TenDichVu" value="<?= htmlspecialchars($service['TenDichVu']) ?>" required>
            </div>
            <div class="mb-3">
                <label for="DonGia" class="form-label">Đơn giá (VNĐ)</label>
                <input type="number" class="form-control" id="DonGia" name="DonGia" value="<?= htmlspecialchars($service['DonGia']) ?>" required min="0">
            </div>
            <div class="mb-3">
                <label for="MoTa" class="form-label">Mô tả</label>
                <textarea class="form-control" id="MoTa" name="MoTa" rows="3"><?= htmlspecialchars($service['MoTa']) ?></textarea>
            </div>
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" value="1" id="HoatDong" name="HoatDong" <?= $service['HoatDong'] ? 'checked' : '' ?>>
                <label class="form-check-label" for="HoatDong">Hoạt động (cho phép hiển thị và sử dụng)</label>
            </div>
            <div class="d-flex justify-content-end">
                <a href="/admin/services" class="btn btn-secondary me-2">Hủy</a>
                <button type="submit" class="btn btn-primary">Cập nhật</button>
            </div>
        </form>
    </div>
</div>