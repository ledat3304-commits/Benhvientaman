<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?? 'Trang Quản trị' ?> - Bệnh viện Tâm An</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="/css/style.css">
    <style>
        body { background-color: #f8f9fa; }
        .sidebar {
            position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
            width: 250px; padding: 48px 0 0; box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
            background-color: #343a40;
        }
        .sidebar-sticky { position: relative; top: 0; height: calc(100vh - 48px); padding-top: .5rem; overflow-x: hidden; overflow-y: auto; }
        .sidebar .nav-link { font-weight: 500; color: rgba(255, 255, 255, .65); }
        .sidebar .nav-link:hover { color: #fff; }
        .sidebar .nav-link.active { color: #fff; }
        .main-content { margin-left: 250px; }
    </style>
</head>
<body>
    <header class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
        <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6" href="/admin/dashboard">Trang Quản Trị</a>
        <div class="navbar-nav">
            <div class="nav-item text-nowrap">
                <a class="nav-link px-3" href="/logout">Đăng xuất</a>
            </div>
        </div>
    </header>

    <div class="container-fluid">
        <div class="row">
            <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block sidebar collapse">
                <div class="position-sticky pt-3 sidebar-sticky">
                    <ul class="nav flex-column">
                        <li class="nav-item"><a class="nav-link active" href="/admin/dashboard"><i class="fas fa-tachometer-alt fa-fw me-2"></i>Bảng điều khiển</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/admin/appointments"><i class="fas fa-calendar-check fa-fw me-2"></i>Quản lý Lịch hẹn</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/admin/doctors"><i class="fas fa-user-md fa-fw me-2"></i>Quản lý Bác sĩ</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/admin/patients"><i class="fas fa-user-injured fa-fw me-2"></i>Quản lý Bệnh nhân</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/admin/schedules"><i class="fas fa-calendar-alt fa-fw me-2"></i>Quản lý Lịch làm việc</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/admin/specialties"><i class="fas fa-stethoscope fa-fw me-2"></i>Quản lý Chuyên khoa</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/admin/services"><i class="fas fa-concierge-bell fa-fw me-2"></i>Quản lý Dịch vụ</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/admin/medicines"><i class="fas fa-pills fa-fw me-2"></i>Quản lý Thuốc</a></li>
                    </ul>
                </div>
            </nav>

            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2"><?= $title ?? 'Dashboard' ?></h1>
                </div>
                <?= $content ?? '' ?>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
