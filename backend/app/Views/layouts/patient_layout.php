<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title ?? 'Bệnh nhân - Bệnh viện Tâm An') ?></title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; }
        .sidebar { width: 250px; position: fixed; top: 0; bottom: 0; left: 0; background-color: #1b365d; color: #fff; z-index: 1000; display: flex; flex-direction: column; }
        .sidebar .brand { padding: 20px; font-size: 1.2rem; font-weight: bold; color: #fff; text-decoration: none; display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar .nav-link { color: #d0dceb; padding: 12px 20px; display: flex; align-items: center; gap: 10px; text-decoration: none; transition: 0.2s; }
        .sidebar .nav-link:hover, .sidebar .nav-link.active { color: #fff; background-color: #0f2341; }
        .main-content { margin-left: 250px; padding: 30px; }
    </style>
</head>
<body>

<div class="sidebar">
    <a href="/patient/appointments" class="brand">
        <i class="fas fa-hospital me-2 text-info"></i>
        <span>Bệnh viện Tâm An</span>
    </a>

    <div class="nav flex-column mt-3">
        <a href="/patient/appointments" class="nav-link <?= (strpos($_SERVER['REQUEST_URI'], '/patient/appointments') !== false) ? 'active' : '' ?>">
            <i class="fas fa-calendar-alt"></i> Lịch hẹn của tôi
        </a>
        <a href="/patient/history" class="nav-link <?= (strpos($_SERVER['REQUEST_URI'], '/patient/history') !== false) ? 'active' : '' ?>">
            <i class="fas fa-notes-medical"></i> Lịch sử khám bệnh
        </a>
    </div>

    <div class="mt-auto p-3 border-top border-secondary">
        <div class="d-flex align-items-center mb-2">
            <i class="fas fa-user-circle me-2"></i>
            <span><?= htmlspecialchars($_SESSION['user']['HoTen'] ?? 'Bệnh nhân') ?></span>
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