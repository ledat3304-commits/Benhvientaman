<?php
/**
 * @package App\Views\Layouts
 */
// Định nghĩa đường dẫn gốc dự án để tránh lỗi 404 trên XAMPP
$baseUrl = '/BenhvienTamAn/public';
?>
<!-- Header -->
<header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="<?= $baseUrl ?>/">
                <i class="fas fa-clinic-medical"></i> Bệnh viện Tâm An
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="main-nav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="<?= $baseUrl ?>/">Trang chủ</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?= $baseUrl ?>/doctors">Đội ngũ Bác sĩ</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?= $baseUrl ?>/services">Dịch vụ</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?= $baseUrl ?>/contact">Liên hệ</a>
                    </li>
                </ul>
                <div class="d-flex align-items-center">
                    <?php if (isset($_SESSION['user'])): ?>
                        <div class="dropdown">
                            <a href="#" class="d-block link-light text-decoration-none dropdown-toggle" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-user me-1"></i>
                                <?= htmlspecialchars(is_array($_SESSION['user']) ? ($_SESSION['user']['HoTen'] ?? $_SESSION['user']['email'] ?? 'Tài khoản') : $_SESSION['user']) ?>
                            </a>
                            <ul class="dropdown-menu text-small" aria-labelledby="dropdownUser">
                                <li><a class="dropdown-item" href="<?= $baseUrl ?>/patient/profile">Hồ sơ của tôi</a></li>
                                <li><a class="dropdown-item" href="<?= $baseUrl ?>/patient/health-profile">Thông tin sức khỏe</a></li>
                                <li><a class="dropdown-item" href="<?= $baseUrl ?>/patient/appointments">Lịch hẹn của tôi</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="<?= $baseUrl ?>/logout">Đăng xuất</a></li>
                            </ul>
                        </div>
                    <?php else: ?>
                        <a href="<?= $baseUrl ?>/appointments/create" class="btn btn-warning me-2">
                            <i class="fas fa-calendar-check me-1"></i> Đặt lịch hẹn
                        </a>
                        <a href="<?= $baseUrl ?>/login" class="btn btn-outline-light">Đăng nhập</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>
</header>