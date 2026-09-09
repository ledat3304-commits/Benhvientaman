<?php $title = 'Đăng ký tài khoản'; ?>

<div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm">
            <div class="card-header text-center bg-primary text-white">
                <h3 class="mb-0">Tạo tài khoản Bệnh nhân</h3>
            </div>
            <div class="card-body p-4">
                <?php if (isset($_SESSION['error_message'])): ?>
                    <div class="alert alert-danger" role="alert">
                        <?= $_SESSION['error_message']; ?>
                        <?php unset($_SESSION['error_message']); ?>
                    </div>
                <?php endif; ?>

                <form action="/register" method="POST" id="registerForm">
                    <div class="mb-3">
                        <label for="HoTen" class="form-label">Họ và Tên</label>
                        <input type="text" class="form-control" id="HoTen" name="HoTen" required>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="NgaySinh" class="form-label">Ngày sinh</label>
                            <input type="date" class="form-control" id="NgaySinh" name="NgaySinh" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="GioiTinh" class="form-label">Giới tính</label>
                            <select class="form-select" id="GioiTinh" name="GioiTinh" required>
                                <option value="" selected disabled>-- Chọn giới tính --</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="Email" class="form-label">Địa chỉ Email</label>
                        <input type="email" class="form-control" id="Email" name="Email" required>
                    </div>
                    <div class="mb-3">
                        <label for="SoDienThoai" class="form-label">Số Điện Thoại</label>
                        <input type="tel" class="form-control" id="SoDienThoai" name="SoDienThoai" required>
                    </div>
                    <div class="mb-3">
                        <label for="MatKhau" class="form-label">Mật khẩu</label>
                        <input type="password" class="form-control" id="MatKhau" name="MatKhau" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirm_password" class="form-label">Xác nhận Mật khẩu</label>
                        <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                    </div>
                    <!-- Vùng OTP -->
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" id="otp" name="otp" placeholder="Nhập mã OTP" required>
                        <button class="btn btn-outline-secondary" type="button" id="sendOtpBtn">Gửi mã</button>
                    </div>
                    <div id="otp-message" class="form-text mb-3"></div>
                    <!-- Kết thúc vùng OTP -->
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary btn-lg">Đăng ký</button>
                    </div>
                    <hr>
                    <p class="text-center">Đã có tài khoản? <a href="/login">Đăng nhập ngay</a></p>
                </form>
            </div>
        </div>
    </div>
</div>
