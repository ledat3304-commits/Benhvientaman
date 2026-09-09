<a href="/admin/schedules" class="btn btn-secondary mb-3"><i class="fas fa-arrow-left me-2"></i>Chọn bác sĩ khác</a>
<div class="card shadow-sm">
    <div class="card-header bg-success text-white">
        <h4 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Đăng ký Lịch làm việc cho: <?= htmlspecialchars($doctor['HoTen']) ?></h4>
    </div>
    <div class="card-body p-4">
        <?php if (isset($_SESSION['success_message'])): ?>
            <div class="alert alert-success" role="alert"><?= $_SESSION['success_message']; unset($_SESSION['success_message']); ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['error_message'])): ?>
            <div class="alert alert-danger" role="alert"><?= $_SESSION['error_message']; unset($_SESSION['error_message']); ?></div>
        <?php endif; ?>

        <p class="text-muted">Chọn các khung giờ bác sĩ có thể làm việc. Lịch này sẽ được lặp lại hàng tuần.</p>
        <hr>

        <form action="/admin/schedules/<?= $doctor['BacSiID'] ?>" method="POST">
            <?php
            $daysOfWeek = [1 => 'Thứ Hai', 2 => 'Thứ Ba', 3 => 'Thứ Tư', 4 => 'Thứ Năm', 5 => 'Thứ Sáu', 6 => 'Thứ Bảy', 0 => 'Chủ Nhật'];
            ?>

            <?php foreach ($daysOfWeek as $dayIndex => $dayName): ?>
                <div class="mb-4 p-3 border rounded bg-light">
                    <h5><?= $dayName ?></h5>
                    <div id="slots-for-day-<?= $dayIndex ?>">
                        <?php if (!empty($schedules[$dayIndex])): ?>
                            <?php foreach ($schedules[$dayIndex] as $slot): ?>
                                <div class="row g-2 mb-2 align-items-center time-slot">
                                    <div class="col"><input type="time" class="form-control" name="schedules[<?= $dayIndex ?>][start][]" value="<?= $slot['GioBatDau'] ?>" required></div>
                                    <div class="col-auto">-</div>
                                    <div class="col"><input type="time" class="form-control" name="schedules[<?= $dayIndex ?>][end][]" value="<?= $slot['GioKetThuc'] ?>" required></div>
                                    <div class="col-auto"><button type="button" class="btn btn-sm btn-outline-danger remove-slot-btn"><i class="fas fa-trash"></i></button></div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary mt-2 add-slot-btn" data-day="<?= $dayIndex ?>"><i class="fas fa-plus me-1"></i>Thêm khung giờ</button>
                </div>
            <?php endforeach; ?>

            <div class="d-grid mt-4">
                <button type="submit" class="btn btn-success btn-lg"><i class="fas fa-save me-2"></i>Lưu Lịch làm việc</button>
            </div>
        </form>
    </div>
</div>

<!-- Template cho một khung giờ mới (dùng cho JavaScript) -->
<template id="time-slot-template">
    <div class="row g-2 mb-2 align-items-center time-slot">
        <div class="col"><input type="time" class="form-control" name="schedules[{day}][start][]" required></div>
        <div class="col-auto">-</div>
        <div class="col"><input type="time" class="form-control" name="schedules[{day}][end][]" required></div>
        <div class="col-auto"><button type="button" class="btn btn-sm btn-outline-danger remove-slot-btn"><i class="fas fa-trash"></i></button></div>
    </div>
</template>

<script>

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.add-slot-btn').forEach(button => {
        button.addEventListener('click', function() {
            const dayIndex = this.dataset.day;
            const template = document.getElementById('time-slot-template').innerHTML;
            const newSlotHtml = template.replace(/{day}/g, dayIndex);
            document.getElementById('slots-for-day-' + dayIndex).insertAdjacentHTML('beforeend', newSlotHtml);
        });
    });
    document.body.addEventListener('click', function(event) {
        if (event.target.closest('.remove-slot-btn')) {
            event.target.closest('.time-slot').remove();
        }
    });
});
</script>