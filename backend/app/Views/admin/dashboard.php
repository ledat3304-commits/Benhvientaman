<style>
    :root {
        --med-primary: #0284c7;
        --med-secondary: #0ea5e9;
        --med-bg: #f8fafc;
        --med-card-bg: #ffffff;
        --med-sidebar: #0f172a;
        --med-text-main: #334155;
        --med-text-muted: #64748b;
    }

    body {
        background-color: var(--med-bg);
        color: var(--med-text-main);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .med-layout {
        display: flex;
        min-height: 100vh;
    }

    /* Sidebar Styling */
    .med-sidebar {
        width: 270px;
        background: var(--med-sidebar);
        color: #fff;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .med-brand {
        padding: 24px;
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: -0.5px;
        color: #fff;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .med-nav-item {
        color: #94a3b8;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.95rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;
    }

    .med-nav-item:hover, .med-nav-item.active {
        color: #fff;
        background: rgba(255, 255, 255, 0.06);
        border-left: 4px solid var(--med-secondary);
    }

    /* Content Area Styling */
    .med-main {
        flex-grow: 1;
        padding: 36px;
        overflow-y: auto;
    }

    .med-card {
        background: var(--med-card-bg);
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .med-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }

    .icon-badge {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
    }

    .table-modern {
        border-collapse: separate;
        border-spacing: 0;
    }

    .table-modern thead th {
        background: #f1f5f9;
        color: var(--med-text-muted);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
        padding: 14px 20px;
        border: none;
    }

    .table-modern tbody td {
        padding: 16px 20px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.95rem;
    }

    .table-modern tbody tr:last-child td {
        border-bottom: none;
    }
</style>

<div class="med-layout">
    <!-- Sidebar Bệnh viện -->
    <aside class="med-sidebar">
        <div>
            <a href="/admin/dashboard" class="med-brand">
                <div class="bg-primary text-white rounded-3 p-2 d-inline-flex">
                    <i class="fas fa-hospital-user"></i>
                </div>
                <span>Bệnh viện Tâm An</span>
            </a>
            <nav class="mt-4">
                <a href="/admin/dashboard" class="med-nav-item active">
                    <i class="fas fa-th-large"></i> Dashboard
                </a>
                <a href="/admin/appointments" class="med-nav-item">
                    <i class="fas fa-calendar-check"></i> Quản lý Lịch hẹn
                </a>
                <a href="/admin/doctors" class="med-nav-item">
                    <i class="fas fa-user-md"></i> Đội ngũ Bác sĩ
                </a>
                <a href="/admin/patients" class="med-nav-item">
                    <i class="fas fa-users"></i> Quản lý Bệnh nhân
                </a>
                <a href="/admin/services" class="med-nav-item">
                    <i class="fas fa-briefcase-medical"></i> Danh mục Dịch vụ
                </a>
            </nav>
        </div>

        <div class="p-3 border-top border-secondary border-opacity-25">
            <a href="/logout" class="med-nav-item text-danger rounded-3 p-2">
                <i class="fas fa-sign-out-alt"></i> Đăng xuất hệ thống
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="med-main">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold text-slate-800 mb-1">Tổng quan Quản trị</h2>
                <p class="text-muted mb-0 small">Theo dõi chỉ số và hoạt động khám chữa bệnh theo thời gian thực</p>
            </div>
            <div class="bg-white border rounded-pill px-3 py-2 text-muted small shadow-sm">
                <i class="fas fa-calendar-alt text-primary me-2"></i><?= date('d/m/Y - H:i') ?>
            </div>
        </div>

        <!-- Metric Cards -->
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="med-card p-4">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="text-muted small fw-semibold text-uppercase mb-1">Lịch Hẹn Chờ</p>
                            <h2 class="fw-bold mb-0 text-dark"><?= htmlspecialchars($stats['pending_appointments'] ?? 0) ?></h2>
                        </div>
                        <div class="icon-badge bg-warning bg-opacity-10 text-warning">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="med-card p-4">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="text-muted small fw-semibold text-uppercase mb-1">Khám Hôm Nay</p>
                            <h2 class="fw-bold mb-0 text-dark"><?= htmlspecialchars($stats['today_appointments'] ?? 0) ?></h2>
                        </div>
                        <div class="icon-badge bg-success bg-opacity-10 text-success">
                            <i class="fas fa-user-check"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="med-card p-4">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="text-muted small fw-semibold text-uppercase mb-1">Tổng Số Bác Sĩ</p>
                            <h2 class="fw-bold mb-0 text-dark"><?= htmlspecialchars($stats['total_doctors'] ?? 0) ?></h2>
                        </div>
                        <div class="icon-badge bg-primary bg-opacity-10 text-primary">
                            <i class="fas fa-user-md"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="med-card p-4">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="text-muted small fw-semibold text-uppercase mb-1">Tổng Bệnh Nhân</p>
                            <h2 class="fw-bold mb-0 text-dark"><?= htmlspecialchars($stats['total_patients'] ?? 0) ?></h2>
                        </div>
                        <div class="icon-badge bg-info bg-opacity-10 text-info">
                            <i class="fas fa-procedures"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table Recent Appointments -->
        <div class="med-card overflow-hidden">
            <div class="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
                <h5 class="fw-bold mb-0 text-dark"><i class="fas fa-stream text-primary me-2"></i>Lịch Hẹn Mới Nhất</h5>
                <a href="/admin/appointments" class="btn btn-sm btn-light border rounded-pill px-3 fw-medium">Xem tất cả</a>
            </div>
            <div class="table-responsive">
                <table class="table table-modern align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Bệnh Nhân</th>
                            <th>Bác Sĩ Khám</th>
                            <th>Thời Gian</th>
                            <th class="text-center">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($recentAppointments) && is_array($recentAppointments)): ?>
                            <?php foreach ($recentAppointments as $item): ?>
                                <tr>
                                    <td class="fw-semibold text-dark">
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="rounded-circle bg-light text-secondary d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                                                <i class="fas fa-user small"></i>
                                            </div>
                                            <?= htmlspecialchars($item['TenBenhNhan'] ?? 'Bệnh nhân') ?>
                                        </div>
                                    </td>
                                    <td class="text-primary fw-medium">
                                        <?= htmlspecialchars($item['TenBacSi'] ?? 'Lê Đạt') ?>
                                    </td>
                                    <td class="text-muted">
                                        <?= date('d/m/Y - H:i', strtotime($item['ThoiGianKham'] ?? 'now')) ?>
                                    </td>
                                    <td class="text-center">
                                        <?php if (($item['TrangThai'] ?? '') === 'DaHoanThanh'): ?>
                                            <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                                                ● Đã Hoàn Thành
                                            </span>
                                        <?php else: ?>
                                            <span class="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2">
                                                ● Chờ Xác Nhận
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="4" class="text-center py-5 text-muted">
                                    Chưa phát sinh lượt hẹn khám nào.
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</div>