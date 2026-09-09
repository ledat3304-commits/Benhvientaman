<div class="card shadow-sm">
    <div class="card-header">
        <h4 class="mb-0">Thêm Chuyên khoa mới</h4>
    </div>
    <div class="card-body">
        <form action="/admin/specialties" method="POST">
            <div class="mb-3">
                <label for="TenChuyenKhoa" class="form-label">Tên Chuyên khoa</label>
                <input type="text" class="form-control" id="TenChuyenKhoa" name="TenChuyenKhoa" required>
            </div>
            <div class="mb-3">
                <label for="MoTa" class="form-label">Mô tả</label>
                <textarea class="form-control" id="MoTa" name="MoTa" rows="4"></textarea>
            </div>
            <div class="d-flex justify-content-end">
                <a href="/admin/specialties" class="btn btn-secondary me-2">Hủy</a>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
    </div>
</div>