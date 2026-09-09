<div class="card shadow-sm">
    <div class="card-header">
        <h4 class="mb-0">Thông tin Bác sĩ mới</h4>
    </div>
    <div class="card-body">
        <form action="/admin/doctors/store" method="POST">
            <h5>Thông tin tài khoản</h5>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="HoTen" class="form-label">Họ và Tên</label>
                    <input type="text" class="form-control" id="HoTen" name="HoTen" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="Email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="Email" name="Email" required>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="SoDienThoai" class="form-label">Số điện thoại</label>
                    <input type="tel" class="form-control" id="SoDienThoai" name="SoDienThoai">
                </div>
                <div class="col-md-6 mb-3">
                    <label for="MatKhau" class="form-label">Mật khẩu</label>
                    <input type="password" class="form-control" id="MatKhau" name="MatKhau" required>
                </div>
            </div>
            <hr>
            <h5>Thông tin chuyên môn</h5>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="ChuyenKhoaID" class="form-label">Chuyên khoa</label>
                    <select class="form-select" id="ChuyenKhoaID" name="ChuyenKhoaID">
                        <option value="">-- Chọn chuyên khoa --</option>
                        <?php foreach ($specialties as $specialty): ?>
                            <option value="<?= $specialty['ChuyenKhoaID'] ?>"><?= htmlspecialchars($specialty['TenChuyenKhoa']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="KinhNghiem" class="form-label">Kinh nghiệm</label>
                    <input type="text" class="form-control" id="KinhNghiem" name="KinhNghiem" placeholder="Ví dụ: 5 năm">
                </div>
            </div>
            <div class="mb-3">
                <label for="MoTa" class="form-label">Mô tả</label>
                <textarea class="form-control" id="MoTa" name="MoTa" rows="3"></textarea>
            </div>

            <div class="d-flex justify-content-end">
                <a href="/admin/doctors" class="btn btn-secondary me-2">Hủy</a>
                <button type="submit" class="btn btn-primary">Lưu Bác sĩ</button>
            </div>
        </form>
    </div>
</div>