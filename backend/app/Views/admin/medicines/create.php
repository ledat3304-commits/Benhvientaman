<div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold text-dark mb-0">Thêm Mới Thuốc</h3>
        <a href="/admin/medicines" class="btn btn-outline-secondary rounded-pill px-3">
            <i class="fas fa-arrow-left me-1"></i> Quay lại
        </a>
    </div>

    <div class="card border-0 shadow-sm rounded-3">
        <div class="card-body p-4">
            <form action="/admin/medicines/store" method="POST">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Tên Thuốc <span class="text-danger">*</span></label>
                        <input type="text" name="TenThuoc" class="form-control" placeholder="Nhập tên thuốc" required>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-bold">Đơn Vị Tính</label>
                        <input type="text" name="DonViTinh" class="form-control" placeholder="Ví dụ: Viên, Hộp, Vỉ">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-bold">Đơn Giá (VNĐ)</label>
                        <input type="number" name="DonGia" class="form-control" placeholder="0" min="0">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-bold">Cách Dùng / Ghi Chú</label>
                        <input type="text" name="CachDung" class="form-control" placeholder="Nhập hướng dẫn sử dụng">
                    </div>

                    <div class="col-12 mt-4 text-end">
                        <button type="submit" class="btn btn-primary rounded-pill px-4">
                            <i class="fas fa-save me-1"></i> Lưu Thông Tin
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>