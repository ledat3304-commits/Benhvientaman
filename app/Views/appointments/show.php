<?php $title = 'Chi tiết Lịch hẹn'; ?>

<div class="container mt-4">
    <!-- Phần thông tin lịch hẹn -->
    <div class="card shadow-sm mb-4">
        <div class="card-header bg-info text-white">
            <h4 class="mb-0">Chi tiết Lịch hẹn #<?= $appointment['LichKhamID'] ?></h4>
        </div>
        <div class="card-body">
            <div class="row">
                <!-- Cột thông tin bệnh nhân -->
                <div class="col-md-5">
                    <h5>Thông tin Bệnh nhân</h5>
                    <p><strong>Họ tên:</strong> <?= htmlspecialchars($appointment['TenBenhNhan']) ?></p>
                    <p><strong>Ngày sinh:</strong> <?= date('d/m/Y', strtotime($appointment['NgaySinh'])) ?></p>
                    <p><strong>Giới tính:</strong> <?= htmlspecialchars($appointment['GioiTinh']) ?></p>
                    <p><strong>Số điện thoại:</strong> <?= htmlspecialchars($appointment['SDTBenhNhan']) ?></p>
                </div>
                <!-- Cột thông tin lịch hẹn -->
                <div class="col-md-7">
                    <h5>Thông tin Lịch hẹn</h5>
                    <p><strong>Bác sĩ phụ trách:</strong> <?= htmlspecialchars($appointment['TenBacSi']) ?></p>
                    <p><strong>Thời gian khám:</strong> <span class="fw-bold"><?= date('d/m/Y H:i', strtotime($appointment['ThoiGianKham'])) ?></span></p>
                    <p><strong>Trạng thái:</strong> <span class="badge bg-primary fs-6"><?= htmlspecialchars($appointment['TrangThai']) ?></span></p>
                    <p><strong>Lý do khám:</strong></p>
                    <p class="border p-2 bg-light rounded"><?= nl2br(htmlspecialchars($appointment['LyDoKham'])) ?></p>
                </div>
            </div>
            <hr>
        </div>
    </div>

    <!-- Form Khám Bệnh -->
    <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-file-medical me-2"></i>Hồ sơ khám bệnh</h4>
        </div>
        <div class="card-body">
            <?php if (isset($_SESSION['success_message'])): ?>
                <div class="alert alert-success" role="alert">
                    <?= $_SESSION['success_message']; unset($_SESSION['success_message']); ?>
                </div>
            <?php endif; ?>
            <?php if (isset($_SESSION['error_message'])): ?>
                <div class="alert alert-danger" role="alert">
                    <?= $_SESSION['error_message']; unset($_SESSION['error_message']); ?>
                </div>
            <?php endif; ?>

            <form action="/appointments/<?= $appointment['LichKhamID'] ?>/process" method="POST">
                <!-- Thông tin lâm sàng -->
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="trieu_chung" class="form-label fw-bold">Triệu chứng</label>
                        <textarea class="form-control" id="trieu_chung" name="trieu_chung" rows="4"><?= htmlspecialchars($appointment['TrieuChung'] ?? '') ?></textarea>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="chuan_doan" class="form-label fw-bold">Chẩn đoán</label>
                        <textarea class="form-control" id="chuan_doan" name="chuan_doan" rows="4"><?= htmlspecialchars($appointment['ChuanDoan'] ?? '') ?></textarea>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="phac_do_dieu_tri" class="form-label fw-bold">Phác đồ điều trị</label>
                    <textarea class="form-control" id="phac_do_dieu_tri" name="phac_do_dieu_tri" rows="3"><?= htmlspecialchars($appointment['PhacDoDieuTri'] ?? '') ?></textarea>
                </div>

                <!-- Kê đơn thuốc -->
                <h5 class="mt-4">Kê đơn thuốc</h5>
                <div id="prescription-container">
                    <!-- Các dòng thuốc đã kê sẽ được JS chèn vào đây -->
                </div>
                <button type="button" id="add-medicine-btn" class="btn btn-sm btn-outline-primary"><i class="fas fa-plus me-1"></i>Thêm thuốc</button>
                <hr>

                <!-- Ghi chú và Tái khám -->
                <div class="row">
                    <div class="col-md-8 mb-3">
                        <label for="ghi_chu_bac_si" class="form-label fw-bold">Ghi chú / Lời dặn</label>
                        <textarea class="form-control" id="ghi_chu_bac_si" name="ghi_chu_bac_si" rows="3"><?= htmlspecialchars($appointment['GhiChuCuaBacSi'] ?? '') ?></textarea>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="ngay_tai_kham" class="form-label fw-bold">Ngày tái khám</label>
                        <input type="date" class="form-control" id="ngay_tai_kham" name="ngay_tai_kham" value="<?= htmlspecialchars($appointment['NgayTaiKham'] ?? '') ?>">
                    </div>
                </div>

                <div class="d-grid mt-3">
                    <button type="submit" class="btn btn-primary btn-lg"><i class="fas fa-save me-2"></i>Lưu và Hoàn thành Khám</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Template cho một dòng thuốc (dùng cho JavaScript) -->
<template id="medicine-row-template">
    <div class="row g-2 mb-2 medicine-row">
        <div class="col-md-5">
            <select class="form-select" name="thuoc[id][]">
                <option value="">-- Chọn thuốc --</option>
                <?php foreach ($medicines as $medicine): ?>
                    <option value="<?= $medicine['ThuocID'] ?>"><?= htmlspecialchars($medicine['TenThuoc']) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control" name="thuoc[soluong][]" placeholder="Số lượng" min="1">
        </div>
        <div class="col-md-4">
            <input type="text" class="form-control" name="thuoc[huongdan][]" placeholder="Hướng dẫn sử dụng">
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-danger remove-medicine-btn"><i class="fas fa-trash"></i></button>
        </div>
    </div>
</template>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('prescription-container');
    const template = document.getElementById('medicine-row-template').innerHTML;
    
    // Thêm dòng thuốc mới
    document.getElementById('add-medicine-btn').addEventListener('click', function() {
        container.insertAdjacentHTML('beforeend', template);
    });

    // Xóa dòng thuốc
    container.addEventListener('click', function(event) {
        if (event.target.closest('.remove-medicine-btn')) {
            event.target.closest('.medicine-row').remove();
        }
    });

    // Hiển thị các thuốc đã được kê từ trước (nếu có)
    const existingPrescriptions = <?= json_encode($prescriptions) ?>;
    existingPrescriptions.forEach(p => {
        container.insertAdjacentHTML('beforeend', template);
        const newRow = container.lastElementChild;
        newRow.querySelector('select[name="thuoc[id][]"]').value = p.ThuocID;
        newRow.querySelector('input[name="thuoc[soluong][]"]').value = p.SoLuong;
        newRow.querySelector('input[name="thuoc[huongdan][]"]').value = p.HuongDanSuDung;
    });
});
</script>
