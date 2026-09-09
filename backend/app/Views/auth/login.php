<style>
    .login-container {
        min-height: 80vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        padding: 40px 15px;
    }
    .login-card {
        border: none;
        border-radius: 20px;
        box-shadow: 0 15px 35px rgba(14, 165, 233, 0.12);
        background: #ffffff;
        overflow: hidden;
        max-width: 460px;
        width: 100%;
    }
    .login-header {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: #ffffff;
        padding: 35px 25px;
        text-center;
    }
    .login-header .icon-box {
        width: 65px;
        height: 65px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(5px);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
    }
    .input-group-text {
        background-color: #f8fafc;
        border-right: none;
        color: #0284c7;
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
    }
    .form-control-lg {
        border-left: none;
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
        font-size: 0.95rem;
        background-color: #f8fafc;
    }
    .form-control-lg:focus {
        background-color: #fff;
        box-shadow: none;
        border-color: #dee2e6;
    }
    .btn-login {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        border: none;
        border-radius: 12px;
        padding: 12px;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    .btn-login:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3);
        background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
    }
</style>

<div class="login-container">
    <div class="login-card">
        <div class="login-header text-center">
            <div class="icon-box">
                <i class="fas fa-user-shield fa-2x text-white"></i>
            </div>
            <h4 class="fw-bold mb-1">Đăng Nhập Hệ Thống</h4>
            <p class="small text-white-50 mb-0">Cổng thông tin Bệnh viện Tâm An</p>
        </div>

        <div class="card-body p-4 p-md-5">
            <?php if (isset($_SESSION['error_message'])): ?>
                <div class="alert alert-danger alert-dismissible fade show rounded-3 small mb-4" role="alert">
                    <i class="fas fa-exclamation-circle me-1"></i> <?= $_SESSION['error_message'] ?>
                    <?php unset($_SESSION['error_message']); ?>
                </div>
            <?php endif; ?>

            <form action="/login" method="POST">
                <div class="mb-3">
                    <label class="form-label fw-semibold text-secondary small">Email hoặc Số điện thoại</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                        <input type="text" name="username" class="form-control form-control-lg" placeholder="nhap@email.com hoac 090..." required autofocus>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold text-secondary small">Mật khẩu</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-lock"></i></span>
                        <input type="password" name="password" class="form-control form-control-lg" placeholder="••••••••" required>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="remember" id="rememberMe">
                        <label class="form-check-label small text-muted" for="rememberMe">Ghi nhớ đăng nhập</label>
                    </div>
                    <a href="/contact" class="small text-primary text-decoration-none">Quên mật khẩu?</a>
                </div>

                <button type="submit" class="btn btn-primary btn-login w-100 text-white mb-3">
                    <i class="fas fa-sign-in-alt me-2"></i>Đăng Nhập
                </button>

                <div class="text-center">
                    <span class="small text-muted">Chưa có tài khoản?</span>
                    <a href="/register" class="small text-primary fw-bold text-decoration-none ms-1">Đăng ký ngay</a>
                </div>
            </form>
        </div>
    </div>
</div>