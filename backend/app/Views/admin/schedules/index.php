<div class="card shadow-sm">
    <div class="card-header">
        <h4 class="mb-0">Chọn Bác sĩ để quản lý lịch làm việc</h4>
    </div>
    <div class="card-body">
        <form id="selectDoctorForm">
            <div class="mb-3">
                <label for="doctor_id" class="form-label">Danh sách Bác sĩ</label>
                <select id="doctor_id" class="form-select form-select-lg">
                    <option selected disabled>-- Vui lòng chọn một bác sĩ --</option>
                    <?php foreach ($doctors as $doctor): ?>
                        <option value="<?= $doctor['BacSiID'] ?>"><?= htmlspecialchars($doctor['HoTen']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Xem và sửa lịch</button>
        </form>
    </div>
</div>

<script>
document.getElementById('selectDoctorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const doctorId = document.getElementById('doctor_id').value;
    if (doctorId) {
        window.location.href = '/admin/schedules/' + doctorId;
    } else {
        alert('Vui lòng chọn một bác sĩ.');
    }
});
</script>