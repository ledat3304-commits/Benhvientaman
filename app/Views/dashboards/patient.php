<?php
// require_once __DIR__ . '/../layouts/header.php';
?>

<h1>Chào mừng, <?= htmlspecialchars($user['HoTen']) ?>!</h1>
<p>Đây là trang thông tin cá nhân của bạn.</p>
<ul>
    <li><a href="/appointments/create">Đặt lịch khám mới</a></li>
    <li><a href="/patient/appointments">Xem lịch sử khám bệnh</a></li>
    <li><a href="/patient/profile">Cập nhật hồ sơ</a></li>
    <li><a href="/logout">Đăng xuất</a></li>
</ul>

<?php // require_once __DIR__ . '/../layouts/footer.php'; ?>