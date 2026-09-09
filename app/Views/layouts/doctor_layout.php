<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title ?? 'Bác sĩ - Bệnh viện Tâm An') ?></title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; }
        .sidebar { width: 250px; position: fixed; top: 0; bottom: 0; left: 0; background-color: #2c3e50; color: #fff; z-index: 1000; display: flex; flex-direction: column; }
        .sidebar .brand { padding: 20px; font-size: 1.2rem; font-weight: bold; color: #fff; text-decoration: none; display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar .nav-link { color: #b8c7ce; padding: 12px 20px; display: flex; align-items: center; gap: 10px; text-decoration: none; transition: 0.2s; }
        .sidebar .nav-link:hover, .sidebar .nav-link.active { color: #fff; background-color: #1a252f; }
        .main-content { margin-left: 250px; padding: 30px; }
    </style>
</head>
<body>

<div class="sidebar">
    <a href="/doctor/dashboard" class="brand">
        <i class="fas fa-hospital-user me-2 text-primary"></i>
        <span>Bệnh viện Tâm An</span>
    </a>

    <div class="nav flex-column mt-3">
        <a href="/doctor/dashboard" class="nav-link <?= ($_SERVER['REQUEST_URI'] == '/doctor/dashboard') ? 'active' : '' ?>">
            <i class="fas fa-tachometer-alt"></i> Bảng điều khiển
        </a>
        <a href="/doctor/appointments" class="nav-link <?= (strpos($_SERVER['REQUEST_URI'], '/doctor/appointments') !== false) ? 'active' : '' ?>">
            <i class="fas fa-calendar-check"></i> Lịch hẹn
        </a>
        <a href="/doctor/schedules" class="nav-link <?= (strpos($_SERVER['REQUEST_URI'], '/doctor/schedule') !== false) ? 'active' : '' ?>">
            <i class="fas fa-calendar-alt"></i> Lịch làm việc
        </a>
        <a href="/doctor/patients" class="nav-link <?= (strpos($_SERVER['REQUEST_URI'], '/doctor/patients') !== false) ? 'active' : '' ?>">
            <i class="fas fa-user-injured"></i> Bệnh nhân
        </a>
    </div>

    <div class="mt-auto p-3 border-top border-secondary">
        <div class="d-flex align-items-center mb-2">
            <i class="fas fa-user-md me-2"></i>
            <span><?= htmlspecialchars($_SESSION['user']['HoTen'] ?? 'Bác sĩ') ?></span>
        </div>
        <a href="/logout" class="text-danger text-decoration-none small">
            <i class="fas fa-sign-out-alt me-1"></i> Đăng xuất
        </a>
    </div>
</div>

<div class="main-content">
    <?php echo $content ?? ''; ?>
</div>

</body>
</html>