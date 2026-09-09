<?php $title = 'Hồ sơ cá nhân'; ?>

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card shadow-sm">
                <div class="card-header bg-success text-white">
                    <h4 class="mb-0"><i class="fas fa-id-card me-2"></i>Hồ sơ cá nhân</h4>
                </div>
                <div class="card-body p-4">

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

                    <form action="/doctor/profile/update" method="POST">
                        <!-- Thông tin cơ bản (không cho phép chỉnh sửa) -->
                        <h5 class="mb-3">Thông tin cơ bản</h5>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Họ và Tên</label>
                                <input type="text" class="form-control" value="<?= htmlspecialchars($doctor['HoTen']) ?>" readonly>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" value="<?= htmlspecialchars($doctor['Email']) ?>" readonly>
                            </div>
                        </div>
                        <div class="row mb-4">
                             <div class="col-md-6">
                                <label class="form-label">Số điện thoại</label>
                                <input type="text" class="form-control" value="<?= htmlspecialchars($doctor['SoDienThoai']) ?>" readonly>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Chuyên khoa</label>
                                <input type="text" class="form-control" value="<?= htmlspecialchars($doctor['TenChuyenKhoa'] ?? 'Chưa cập nhật') ?>" readonly>
                            </div>
                        </div>

                        <hr>

                        <!-- Thông tin chuyên môn (cho phép chỉnh sửa) -->
                        <h5 class="mb-3">Thông tin chuyên môn</h5>
                        <div class="mb-3">
                            <label for="KinhNghiem" class="form-label">Kinh nghiệm</label>
                            <input type="text" class="form-control" id="KinhNghiem" name="KinhNghiem" value="<?= htmlspecialchars($doctor['KinhNghiem']) ?>">
                            <div class="form-text">Ví dụ: "10 năm kinh nghiệm trong lĩnh vực Tim mạch".</div>
                        </div>
                        <div class="mb-3">
                            <label for="MoTa" class="form-label">Mô tả bản thân</label>
                            <textarea class="form-control" id="MoTa" name="MoTa" rows="5"><?= htmlspecialchars($doctor['MoTa']) ?></textarea>
                            <div class="form-text">Mô tả về quá trình học tập, công tác, các thành tựu đã đạt được...</div>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-success btn-lg">
                                <i class="fas fa-save me-2"></i>Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
