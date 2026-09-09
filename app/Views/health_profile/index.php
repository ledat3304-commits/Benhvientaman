<?php $title = 'Thông tin Sức khỏe'; ?>

<div class="container mt-4">
    <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-heartbeat me-2"></i>Thông tin Sức khỏe</h4>
        </div>
        <div class="card-body p-4">
            <p class="text-muted">Khai báo các thông tin về tiền sử bệnh, dị ứng... để giúp bác sĩ chẩn đoán chính xác hơn.</p>
            
            <?php if (isset($_SESSION['success_message'])): ?>
                <div class="alert alert-success" role="alert"><?= $_SESSION['success_message']; unset($_SESSION['success_message']); ?></div>
            <?php endif; ?>
            <?php if (isset($_SESSION['error_message'])): ?>
                <div class="alert alert-danger" role="alert"><?= $_SESSION['error_message']; unset($_SESSION['error_message']); ?></div>
            <?php endif; ?>

            <form action="/patient/health-profile/update" method="POST">
                <div id="health-info-container">
                </div>
                <button type="button" id="add-info-btn" class="btn btn-sm btn-outline-primary mt-2"><i class="fas fa-plus me-1"></i>Thêm thông tin</button>
                <hr>
                <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-lg"><i class="fas fa-save me-2"></i>Lưu thông tin sức khỏe</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Template cho một dòng thông tin (dùng cho JavaScript) -->
<template id="health-info-row-template">
    <div class="row g-2 mb-2 health-info-row">
        <div class="col-md-4">
            <select class="form-select" name="health_info[type][]">
                <option value="">-- Chọn loại --</option>
                <option value="Tiền sử bệnh">Tiền sử bệnh</option>
                <option value="Dị ứng">Dị ứng</option>
                <option value="Phẫu thuật">Phẫu thuật</option>
            </select>
        </div>
        <div class="col-md-7">
            <input type="text" class="form-control" name="health_info[description][]" placeholder="Mô tả chi tiết (ví dụ: Dị ứng với penicillin, Đã phẫu thuật ruột thừa năm 2010)">
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-danger remove-info-btn"><i class="fas fa-trash"></i></button>
        </div>
    </div>
</template>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('health-info-container');
    const template = document.getElementById('health-info-row-template').innerHTML;
    const existingInfo = <?= json_encode($healthInfo) ?>;

    function addRow(info = null) {
        container.insertAdjacentHTML('beforeend', template);
        if (info) {
            const newRow = container.lastElementChild;
            newRow.querySelector('select').value = info.Loai;
            newRow.querySelector('input[type="text"]').value = info.MoTa;
        }
    }

    // Thêm dòng mới
    document.getElementById('add-info-btn').addEventListener('click', () => addRow());

    // Xóa dòng
    container.addEventListener('click', function(event) {
        if (event.target.closest('.remove-info-btn')) {
            event.target.closest('.health-info-row').remove();
        }
    });

    // Hiển thị các thông tin đã có
    if (existingInfo.length > 0) {
        existingInfo.forEach(info => addRow(info));
    } else {
        addRow(); // Thêm một dòng trống nếu chưa có thông tin
    }
});
</script>