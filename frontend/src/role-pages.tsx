import { FormEvent, useEffect, useMemo, useState } from 'react';

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000'
).replace(/\/$/, '');

const STORAGE_KEY = 'bta_session';

type Session = {
  token?: string;
  user?: {
    UserID?: number;
    userid?: number;
    HoTen?: string;
    hoten?: string;
    Email?: string;
    email?: string;
    VaiTro?: string;
    vaitro?: string;
  };
};

function readSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function authHeaders(session: Session | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = session?.token;
  const userId = session?.user?.UserID ?? session?.user?.userid;

  if (token) headers.Authorization = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = String(userId);
  return headers;
}

function getValue(row: Record<string, any>, ...keys: string[]) {
  return keys.map((key) => row[key]).find((value) => value !== undefined && value !== null) ?? '';
}

async function adminFetch(path: string, session: Session | null, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: authHeaders(session)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Không thể thực hiện thao tác quản trị.');
  }
  return data;
}

function formatAdminDate(value: unknown) {
  if (!value) return '—';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
}

function formatAdminMoney(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `${amount.toLocaleString('vi-VN')} đ` : '—';
}

function statusLabel(value: unknown) {
  const labels: Record<string, string> = {
    ChoXacNhan: 'Chờ xác nhận',
    DaXacNhan: 'Đã xác nhận',
    DangKham: 'Đang khám',
    HoanThanh: 'Hoàn thành',
    DaHuy: 'Đã hủy',
    VangMat: 'Vắng mặt'
  };
  return labels[String(value || '')] || String(value || 'Chưa cập nhật');
}

type AdminSection = 'overview' | 'notifications' | 'appointments' | 'patients' | 'users' | 'doctors' | 'catalog';

export function AdminDashboardPage() {
  const session = readSession();
  const [section, setSection] = useState<AdminSection>('overview');
  const [notifications, setNotifications] = useState<Record<string, any>[]>([]);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [appointments, setAppointments] = useState<Record<string, any>[]>([]);
  const [patients, setPatients] = useState<Record<string, any>[]>([]);
  const [users, setUsers] = useState<Record<string, any>[]>([]);
  const [doctors, setDoctors] = useState<Record<string, any>[]>([]);
  const [specialties, setSpecialties] = useState<Record<string, any>[]>([]);
  const [services, setServices] = useState<Record<string, any>[]>([]);
  const [medicines, setMedicines] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [savingId, setSavingId] = useState<string | number>('');
  const [catalogTab, setCatalogTab] = useState<'services' | 'specialties' | 'medicines'>('services');
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', phone: '', password: '', specialtyId: '', experience: '', description: '' });
  const [specialtyForm, setSpecialtyForm] = useState({ name: '', description: '' });
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '0' });
  const [medicineForm, setMedicineForm] = useState({ name: '', activeIngredient: '', unit: '' });

  const loadData = async () => {
    if (!session?.token && !session?.user) {
      setLoading(false);
      setError('Phiên đăng nhập admin không tồn tại.');
      return;
    }

    setLoading(true);
    try {
      const [dashboard, notificationData, appointmentData, patientData, userData, doctorData, specialtyData, serviceData, medicineData] = await Promise.all([
        adminFetch('/api/admin/dashboard', session),
        adminFetch('/api/admin/notifications?limit=100', session),
        adminFetch('/api/admin/appointments', session),
        adminFetch('/api/admin/patients', session),
        adminFetch('/api/admin/users', session),
        adminFetch('/api/admin/doctors', session),
        adminFetch('/api/admin/specialties', session),
        adminFetch('/api/admin/services', session),
        adminFetch('/api/admin/medicines', session)
      ]);
      setStats(dashboard.stats || {});
      setNotifications(notificationData.notifications || []);
      setAppointments(appointmentData.appointments || []);
      setPatients(patientData.patients || []);
      setUsers(userData.users || []);
      setDoctors(doctorData.doctors || []);
      setSpecialties(specialtyData.specialties || []);
      setServices(serviceData.services || []);
      setMedicines(medicineData.medicines || []);
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = window.setInterval(loadData, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(''), 3500);
  };

  const markAsRead = async (notificationId: string | number) => {
    try {
      await adminFetch(`/api/admin/notifications/${notificationId}/read`, session, { method: 'PATCH' });
      setNotifications((items) => items.map((item) => String(getValue(item, 'thongbaoid', 'ThongBaoID')) === String(notificationId) ? { ...item, dadoc: true, DaDoc: true } : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật thông báo.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminFetch('/api/admin/notifications/read-all', session, { method: 'PATCH' });
      setNotifications((items) => items.map((item) => ({ ...item, dadoc: true, DaDoc: true })));
      setStats((current) => ({ ...current, unreadNotifications: 0 }));
      showActionMessage('Đã đánh dấu toàn bộ thông báo là đã đọc.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật thông báo.');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string | number, status: string) => {
    setSavingId(appointmentId);
    try {
      await adminFetch(`/api/admin/appointments/${appointmentId}/status`, session, { method: 'PATCH', body: JSON.stringify({ status }) });
      setAppointments((items) => items.map((item) => String(getValue(item, 'lichkhamid', 'LichKhamID')) === String(appointmentId) ? { ...item, trangthai: status, TrangThai: status } : item));
      showActionMessage('Đã cập nhật trạng thái lịch khám.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật lịch khám.');
    } finally {
      setSavingId('');
    }
  };

  const updateUserStatus = async (user: Record<string, any>) => {
    const userId = getValue(user, 'userid', 'UserID');
    const active = Boolean(getValue(user, 'hoatdong', 'HoatDong'));
    setSavingId(userId);
    try {
      const data = await adminFetch(`/api/admin/users/${userId}/status`, session, { method: 'PATCH', body: JSON.stringify({ active: !active }) });
      setUsers((items) => items.map((item) => String(getValue(item, 'userid', 'UserID')) === String(userId) ? data.user : item));
      showActionMessage(`Đã ${active ? 'khóa' : 'mở khóa'} tài khoản.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật tài khoản.');
    } finally {
      setSavingId('');
    }
  };

  const updateUserRole = async (user: Record<string, any>, role: string) => {
    const userId = getValue(user, 'userid', 'UserID');
    setSavingId(`role-${userId}`);
    try {
      const data = await adminFetch(`/api/admin/users/${userId}/role`, session, { method: 'PATCH', body: JSON.stringify({ role, phone: getValue(user, 'sodienthoai', 'SoDienThoai') }) });
      setUsers((items) => items.map((item) => String(getValue(item, 'userid', 'UserID')) === String(userId) ? data.user : item));
      showActionMessage('Đã cập nhật vai trò người dùng.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật vai trò.');
    } finally {
      setSavingId('');
    }
  };

  const createDoctor = async (event: FormEvent) => {
    event.preventDefault();
    setSavingId('new-doctor');
    try {
      await adminFetch('/api/admin/doctors', session, { method: 'POST', body: JSON.stringify({ ...doctorForm, specialtyId: doctorForm.specialtyId || null }) });
      setDoctorForm({ name: '', email: '', phone: '', password: '', specialtyId: '', experience: '', description: '' });
      const data = await adminFetch('/api/admin/doctors', session);
      setDoctors(data.doctors || []);
      showActionMessage('Đã tạo tài khoản bác sĩ.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tạo bác sĩ.');
    } finally {
      setSavingId('');
    }
  };

  const createCatalogItem = async (event: FormEvent, type: 'specialty' | 'service' | 'medicine') => {
    event.preventDefault();
    const config = {
      specialty: { path: '/api/admin/specialties', body: specialtyForm, reset: () => setSpecialtyForm({ name: '', description: '' }), message: 'Đã thêm chuyên khoa.' },
      service: { path: '/api/admin/services', body: { ...serviceForm, price: Number(serviceForm.price || 0) }, reset: () => setServiceForm({ name: '', description: '', price: '0' }), message: 'Đã thêm dịch vụ.' },
      medicine: { path: '/api/admin/medicines', body: medicineForm, reset: () => setMedicineForm({ name: '', activeIngredient: '', unit: '' }), message: 'Đã thêm thuốc.' }
    }[type];
    setSavingId(`new-${type}`);
    try {
      await adminFetch(config.path, session, { method: 'POST', body: JSON.stringify(config.body) });
      config.reset();
      await loadData();
      showActionMessage(config.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể thêm dữ liệu.');
    } finally {
      setSavingId('');
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/login';
  };

  const unreadCount = stats.unreadNotifications ?? notifications.filter((item) => !getValue(item, 'dadoc', 'DaDoc')).length;
  const navItems: Array<{ key: AdminSection; label: string; icon: string; count?: number }> = [
    { key: 'overview', label: 'Tổng quan', icon: '⌂' },
    { key: 'notifications', label: 'Thông báo', icon: '!' , count: unreadCount },
    { key: 'appointments', label: 'Lịch khám', icon: '◷', count: appointments.length },
    { key: 'patients', label: 'Bệnh nhân', icon: '♙', count: patients.length },
    { key: 'users', label: 'Tài khoản', icon: '◎', count: users.length },
    { key: 'doctors', label: 'Bác sĩ', icon: '✚', count: doctors.length },
    { key: 'catalog', label: 'Danh mục', icon: '▦' }
  ];

  if (!session?.token && !session?.user) {
    return <main className="admin-notification-page"><div className="booking-api-card"><h1>Cần đăng nhập</h1><p>Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.</p><a className="button button-primary" href="/login">Đăng nhập</a></div></main>;
  }

  const notificationList = (items: Record<string, any>[]) => (
    <div className="admin-notification-list">
      {items.length === 0 ? <p className="admin-notification-state">Chưa có thông báo.</p> : items.map((item, index) => {
        const id = getValue(item, 'thongbaoid', 'ThongBaoID') || index;
        const isRead = Boolean(getValue(item, 'dadoc', 'DaDoc'));
        return <article className={isRead ? 'admin-notification-item' : 'admin-notification-item is-unread'} key={id}>
          <div><strong>{getValue(item, 'tieude', 'TieuDe') || 'Thông báo hệ thống'}</strong><p>{getValue(item, 'noidung', 'NoiDung')}</p><small>{formatAdminDate(getValue(item, 'ngaytao', 'NgayTao'))}</small></div>
          {!isRead && <button type="button" onClick={() => markAsRead(id)}>Đánh dấu đã đọc</button>}
        </article>;
      })}
    </div>
  );

  const overview = <>
    <div className="admin-welcome-card"><div><span className="eyebrow">Bảng điều hành Tâm An</span><h2>Xin chào, {getValue(session.user || {}, 'HoTen', 'hoten') || 'Quản trị viên'}!</h2><p>Theo dõi hoạt động bệnh viện, tiếp nhận lịch khám và quản lý dữ liệu từ một nơi.</p></div><button className="button button-primary" type="button" onClick={() => loadData()}>Làm mới dữ liệu</button></div>
    <div className="admin-stat-grid"><div><span>Tổng người dùng</span><strong>{stats.totalUsers ?? users.length}</strong><small>Đang có trong hệ thống</small></div><div><span>Tổng bệnh nhân</span><strong>{stats.totalPatients ?? patients.length}</strong><small>Hồ sơ người bệnh</small></div><div><span>Tổng lịch khám</span><strong>{stats.totalAppointments ?? appointments.length}</strong><small>Lịch đã tiếp nhận</small></div><div><span>Chưa đọc</span><strong>{unreadCount}</strong><small>Cần được xử lý</small></div></div>
    <div className="admin-content-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Hộp thư hệ thống</span><h2>Thông báo mới nhất</h2></div><button className="button button-outline" type="button" onClick={() => setSection('notifications')}>Xem tất cả</button></div>{notificationList(notifications.slice(0, 5))}</section><section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Điều phối</span><h2>Lịch khám gần đây</h2></div><button className="button button-outline" type="button" onClick={() => setSection('appointments')}>Quản lý lịch</button></div><div className="admin-mini-list">{appointments.slice(0, 6).map((item, index) => <button className="admin-mini-item" type="button" key={getValue(item, 'lichkhamid', 'LichKhamID') || index} onClick={() => setSection('appointments')}><span><strong>{getValue(item, 'tenbenhnhan', 'TenBenhNhan') || 'Khách hàng'}</strong><small>{getValue(item, 'tenbacsi', 'TenBacSi') || 'Chưa có bác sĩ'} · {formatAdminDate(getValue(item, 'thoigiankham', 'ThoiGianKham'))}</small></span><em className={`admin-status admin-status--${String(getValue(item, 'trangthai', 'TrangThai')).toLowerCase()}`}>{statusLabel(getValue(item, 'trangthai', 'TrangThai'))}</em></button>)}{appointments.length === 0 ? <p className="admin-notification-state">Chưa có lịch khám.</p> : null}</div></section></div>
  </>;

  const appointmentsPanel = <section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Điều phối khám bệnh</span><h2>Tất cả lịch khám</h2></div><button className="button button-outline" type="button" onClick={() => loadData()}>Làm mới</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Người bệnh</th><th>Bác sĩ / dịch vụ</th><th>Thời gian</th><th>Lý do khám</th><th>Trạng thái</th></tr></thead><tbody>{appointments.map((item, index) => { const id = getValue(item, 'lichkhamid', 'LichKhamID') || index; return <tr key={id}><td><strong>{getValue(item, 'tenbenhnhan', 'TenBenhNhan') || 'Khách hàng'}</strong><small>{getValue(item, 'sodienthoaibenhnhan', 'SoDienThoaiBenhNhan') || 'Chưa có SĐT'}</small><small>{getValue(item, 'emailbenhnhan', 'EmailBenhNhan') || 'Chưa có email'}</small></td><td><strong>{getValue(item, 'tenbacsi', 'TenBacSi') || '—'}</strong><small>{getValue(item, 'tenchuyenkhoa', 'TenChuyenKhoa') || ''}</small><small>{getValue(item, 'tendichvu', 'TenDichVu') || 'Chưa chọn dịch vụ'}</small></td><td>{formatAdminDate(getValue(item, 'thoigiankham', 'ThoiGianKham'))}</td><td>{getValue(item, 'lydokham', 'LyDoKham', 'trieuchung', 'TrieuChung') || 'Không cung cấp'}</td><td><select className="admin-status-select" value={String(getValue(item, 'trangthai', 'TrangThai') || 'ChoXacNhan')} disabled={String(savingId) === String(id)} onChange={(event) => updateAppointmentStatus(id, event.target.value)}><option value="ChoXacNhan">Chờ xác nhận</option><option value="DaXacNhan">Đã xác nhận</option><option value="DangKham">Đang khám</option><option value="HoanThanh">Hoàn thành</option><option value="DaHuy">Đã hủy</option><option value="VangMat">Vắng mặt</option></select></td></tr>; })}</tbody></table></div>{appointments.length === 0 ? <p className="admin-notification-state">Chưa có lịch khám.</p> : null}</section>;

  const patientsPanel = <section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Hồ sơ người bệnh</span><h2>Danh sách bệnh nhân</h2></div><button className="button button-outline" type="button" onClick={() => loadData()}>Làm mới</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Họ tên</th><th>Liên hệ</th><th>Ngày sinh</th><th>Giới tính</th><th>Địa chỉ</th></tr></thead><tbody>{patients.map((item, index) => <tr key={getValue(item, 'benhnhanid', 'BenhNhanID') || index}><td><strong>{getValue(item, 'hoten', 'HoTen') || 'Chưa cập nhật'}</strong><small>Mã BN: {getValue(item, 'benhnhanid', 'BenhNhanID')}</small></td><td><small>{getValue(item, 'sodienthoai', 'SoDienThoai') || 'Chưa có SĐT'}</small><small>{getValue(item, 'email', 'Email') || 'Chưa có email'}</small></td><td>{formatAdminDate(getValue(item, 'ngaysinh', 'NgaySinh'))}</td><td>{getValue(item, 'gioitinh', 'GioiTinh') || '—'}</td><td>{getValue(item, 'diachi', 'DiaChi') || '—'}</td></tr>)}</tbody></table></div>{patients.length === 0 ? <p className="admin-notification-state">Chưa có bệnh nhân.</p> : null}</section>;

  const usersPanel = <section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Phân quyền hệ thống</span><h2>Quản lý tài khoản</h2></div><button className="button button-outline" type="button" onClick={() => loadData()}>Làm mới</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tài khoản</th><th>Liên hệ</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{users.map((item, index) => { const id = getValue(item, 'userid', 'UserID') || index; const active = Boolean(getValue(item, 'hoatdong', 'HoatDong')); return <tr key={id}><td><strong>{getValue(item, 'hoten', 'HoTen') || 'Chưa cập nhật'}</strong><small>ID: {id}</small></td><td><small>{getValue(item, 'email', 'Email') || '—'}</small><small>{getValue(item, 'sodienthoai', 'SoDienThoai') || '—'}</small></td><td><select className="admin-status-select" value={String(getValue(item, 'vaitro', 'VaiTro') || 'BenhNhan').toLowerCase().includes('quan') || String(getValue(item, 'vaitro', 'VaiTro')).toLowerCase().includes('admin') ? 'admin' : String(getValue(item, 'vaitro', 'VaiTro')).toLowerCase().includes('bac') || String(getValue(item, 'vaitro', 'VaiTro')).toLowerCase().includes('doctor') ? 'doctor' : 'patient'} disabled={String(savingId) === `role-${id}`} onChange={(event) => updateUserRole(item, event.target.value)}><option value="patient">Bệnh nhân</option><option value="doctor">Bác sĩ</option><option value="admin">Quản trị viên</option></select></td><td><span className={active ? 'admin-active-badge' : 'admin-inactive-badge'}>{active ? 'Đang hoạt động' : 'Đã khóa'}</span></td><td><button className="admin-small-button" type="button" disabled={String(savingId) === String(id)} onClick={() => updateUserStatus(item)}>{active ? 'Khóa' : 'Mở khóa'}</button></td></tr>; })}</tbody></table></div>{users.length === 0 ? <p className="admin-notification-state">Chưa có tài khoản.</p> : null}</section>;

  const doctorsPanel = <div className="admin-content-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Đội ngũ chuyên môn</span><h2>Danh sách bác sĩ</h2></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Bác sĩ</th><th>Liên hệ</th><th>Chuyên khoa</th><th>Kinh nghiệm</th></tr></thead><tbody>{doctors.map((item, index) => <tr key={getValue(item, 'bacsiid', 'BacSiID') || index}><td><strong>{getValue(item, 'hoten', 'HoTen') || 'Chưa cập nhật'}</strong><small>Mã BS: {getValue(item, 'bacsiid', 'BacSiID')}</small></td><td><small>{getValue(item, 'email', 'Email') || '—'}</small><small>{getValue(item, 'sodienthoai', 'SoDienThoai') || '—'}</small></td><td>{getValue(item, 'tenchuyenkhoa', 'TenChuyenKhoa') || 'Chưa phân công'}</td><td>{getValue(item, 'kinhnghiem', 'KinhNghiem') || '—'}</td></tr>)}</tbody></table></div></section><section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Tài khoản chuyên môn</span><h2>Thêm bác sĩ</h2></div></div><form className="admin-form" onSubmit={createDoctor}><label>Họ tên<input required value={doctorForm.name} onChange={(event) => setDoctorForm({ ...doctorForm, name: event.target.value })} /></label><label>Email<input required type="email" value={doctorForm.email} onChange={(event) => setDoctorForm({ ...doctorForm, email: event.target.value })} /></label><div className="admin-form-row"><label>Số điện thoại<input value={doctorForm.phone} onChange={(event) => setDoctorForm({ ...doctorForm, phone: event.target.value })} /></label><label>Mật khẩu<input required minLength={6} type="password" value={doctorForm.password} onChange={(event) => setDoctorForm({ ...doctorForm, password: event.target.value })} /></label></div><label>Chuyên khoa<select value={doctorForm.specialtyId} onChange={(event) => setDoctorForm({ ...doctorForm, specialtyId: event.target.value })}><option value="">Chưa phân công</option>{specialties.map((item, index) => <option key={getValue(item, 'chuyenkhoaid', 'ChuyenKhoaID') || index} value={getValue(item, 'chuyenkhoaid', 'ChuyenKhoaID')}>{getValue(item, 'tenchuyenkhoa', 'TenChuyenKhoa')}</option>)}</select></label><label>Kinh nghiệm<input value={doctorForm.experience} onChange={(event) => setDoctorForm({ ...doctorForm, experience: event.target.value })} placeholder="Ví dụ: 15 năm" /></label><label>Mô tả<textarea value={doctorForm.description} onChange={(event) => setDoctorForm({ ...doctorForm, description: event.target.value })} /></label><button className="button button-primary" type="submit" disabled={savingId === 'new-doctor'}>{savingId === 'new-doctor' ? 'Đang tạo...' : 'Tạo tài khoản bác sĩ'}</button></form></section></div>;

  const catalogPanel = <section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Nội dung vận hành</span><h2>Quản lý danh mục</h2></div></div><div className="admin-tabs">{([{ key: 'services', label: `Dịch vụ (${services.length})` }, { key: 'specialties', label: `Chuyên khoa (${specialties.length})` }, { key: 'medicines', label: `Thuốc (${medicines.length})` }] as const).map((tab) => <button type="button" className={catalogTab === tab.key ? 'is-active' : ''} key={tab.key} onClick={() => setCatalogTab(tab.key)}>{tab.label}</button>)}</div>{catalogTab === 'services' ? <div className="admin-catalog-layout"><div className="admin-catalog-list">{services.map((item, index) => <article className="admin-catalog-item" key={getValue(item, 'dichvuid', 'DichVuID') || index}><div><strong>{getValue(item, 'tendichvu', 'TenDichVu')}</strong><small>{getValue(item, 'mota', 'MoTa') || 'Chưa có mô tả.'}</small></div><span>{formatAdminMoney(getValue(item, 'dongia', 'DonGia'))}</span></article>)}</div><form className="admin-form admin-form-card" onSubmit={(event) => createCatalogItem(event, 'service')}><h3>Thêm dịch vụ</h3><label>Tên dịch vụ<input required value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} /></label><label>Mô tả<textarea value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} /></label><label>Giá tham khảo<input type="number" min="0" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })} /></label><button className="button button-primary" type="submit" disabled={savingId === 'new-service'}>Thêm dịch vụ</button></form></div> : null}{catalogTab === 'specialties' ? <div className="admin-catalog-layout"><div className="admin-catalog-list">{specialties.map((item, index) => <article className="admin-catalog-item" key={getValue(item, 'chuyenkhoaid', 'ChuyenKhoaID') || index}><div><strong>{getValue(item, 'tenchuyenkhoa', 'TenChuyenKhoa')}</strong><small>{getValue(item, 'mota', 'MoTa') || 'Chưa có mô tả.'}</small></div></article>)}</div><form className="admin-form admin-form-card" onSubmit={(event) => createCatalogItem(event, 'specialty')}><h3>Thêm chuyên khoa</h3><label>Tên chuyên khoa<input required value={specialtyForm.name} onChange={(event) => setSpecialtyForm({ ...specialtyForm, name: event.target.value })} /></label><label>Mô tả<textarea value={specialtyForm.description} onChange={(event) => setSpecialtyForm({ ...specialtyForm, description: event.target.value })} /></label><button className="button button-primary" type="submit" disabled={savingId === 'new-specialty'}>Thêm chuyên khoa</button></form></div> : null}{catalogTab === 'medicines' ? <div className="admin-catalog-layout"><div className="admin-catalog-list">{medicines.map((item, index) => <article className="admin-catalog-item" key={getValue(item, 'thuocid', 'ThuocID') || index}><div><strong>{getValue(item, 'tenthuoc', 'TenThuoc')}</strong><small>{getValue(item, 'hoatchat', 'HoatChat') || 'Chưa có hoạt chất.'}</small></div><span>{getValue(item, 'donvitinh', 'DonViTinh') || '—'}</span></article>)}</div><form className="admin-form admin-form-card" onSubmit={(event) => createCatalogItem(event, 'medicine')}><h3>Thêm thuốc</h3><label>Tên thuốc<input required value={medicineForm.name} onChange={(event) => setMedicineForm({ ...medicineForm, name: event.target.value })} /></label><label>Hoạt chất<input value={medicineForm.activeIngredient} onChange={(event) => setMedicineForm({ ...medicineForm, activeIngredient: event.target.value })} /></label><label>Đơn vị tính<input required value={medicineForm.unit} onChange={(event) => setMedicineForm({ ...medicineForm, unit: event.target.value })} placeholder="Viên, lọ, hộp..." /></label><button className="button button-primary" type="submit" disabled={savingId === 'new-medicine'}>Thêm thuốc</button></form></div> : null}</section>;

  return <main className="admin-dashboard-page"><div className="admin-dashboard-shell"><header className="admin-dashboard-header"><div><span className="eyebrow">Khu vực quản trị</span><h1>Bảng điều khiển admin</h1><p>{getValue(session.user || {}, 'HoTen', 'hoten') || 'Quản trị viên'} · {getValue(session.user || {}, 'Email', 'email') || 'Không có email'}</p></div><div className="admin-dashboard-actions"><a className="button button-outline" href="/">Xem website</a><button className="button button-outline" type="button" onClick={logout}>Đăng xuất</button></div></header><div className="admin-dashboard-layout"><aside className="admin-sidebar"><p className="admin-sidebar-label">Quản trị hệ thống</p>{navItems.map((item) => <button className={section === item.key ? 'admin-nav-item is-active' : 'admin-nav-item'} type="button" key={item.key} onClick={() => setSection(item.key)}><span className="admin-nav-icon">{item.icon}</span><span>{item.label}</span>{item.count ? <b>{item.count}</b> : null}</button>)}<div className="admin-sidebar-note"><strong>Bảo mật tài khoản</strong><span>Chỉ tài khoản có vai trò quản trị mới truy cập được khu vực này.</span></div></aside><section className="admin-dashboard-content">{loading ? <p className="admin-notification-state">Đang tải dữ liệu quản trị...</p> : null}{error ? <p className="admin-notification-error">{error}</p> : null}{actionMessage ? <p className="admin-action-message">{actionMessage}</p> : null}{!loading && section === 'overview' ? overview : null}{!loading && section === 'notifications' ? <section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">Hộp thư hệ thống</span><h2>Tất cả thông báo</h2></div><div className="admin-heading-actions"><button className="button button-outline" type="button" onClick={markAllAsRead}>Đánh dấu tất cả đã đọc</button><button className="button button-outline" type="button" onClick={() => loadData()}>Làm mới</button></div></div>{notificationList(notifications)}</section> : null}{!loading && section === 'appointments' ? appointmentsPanel : null}{!loading && section === 'patients' ? patientsPanel : null}{!loading && section === 'users' ? usersPanel : null}{!loading && section === 'doctors' ? doctorsPanel : null}{!loading && section === 'catalog' ? catalogPanel : null}</section></div></div></main>;
}

type Doctor = { bacsiid?: number; id?: number; hoten?: string; name?: string; tenchuyenkhoa?: string; specialty?: string };
type Service = { id?: number; dichvuid?: number; name?: string; tendichvu?: string; description?: string; price?: number | string; dongia?: number | string };

export function BookingPageApi() {
  const session = readSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ doctorId: '', serviceId: '', date: '', time: '09:00', name: '', phone: '', email: '', reason: '' });
  const [message, setMessage] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/doctors`).then((response) => response.json()),
      fetch(`${API_BASE}/api/services`).then((response) => response.json())
    ])
      .then(([doctorData, serviceData]) => {
        setDoctors(Array.isArray(doctorData) ? doctorData : []);
        setServices(Array.isArray(serviceData) ? serviceData : []);
      })
      .catch(() => {
        setDoctors([]);
        setServices([]);
      });
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || session?.user?.HoTen || session?.user?.hoten || '',
      email: current.email || session?.user?.Email || session?.user?.email || ''
    }));
  }, [session?.user?.UserID, session?.user?.userid]);

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const selectedDoctor = useMemo(() => doctors.find((doctor) => String(doctor.bacsiid ?? doctor.id) === form.doctorId), [doctors, form.doctorId]);
  const selectedService = useMemo(() => services.find((service) => String(service.id ?? service.dichvuid) === form.serviceId), [services, form.serviceId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: authHeaders(session),
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Không thể đặt lịch.');
      setBookingCode(data.bookingCode || String(data.appointment?.lichkhamid || data.appointment?.LichKhamID || ''));
      setMessage('Lịch khám đã được ghi nhận và thông tin đã báo về tài khoản admin.');
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'Không thể đặt lịch.');
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingCode) {
    return <main className="admin-notification-page"><div className="booking-api-card"><div className="success-check">✓</div><h1>Đặt lịch thành công</h1><p>Mã lịch hẹn: <strong>{bookingCode}</strong></p><p className="form-success">{message}</p><a className="button button-primary" href="/">Về trang chủ</a></div></main>;
  }

  return (
    <main className="admin-notification-page">
      <div className="booking-api-card">
        <span className="eyebrow">Đặt lịch trực tuyến</span>
        <h1>Gửi thông tin lịch khám</h1>
        <p>Thông tin đăng ký sẽ được lưu vào hệ thống và báo ngay cho tài khoản admin.</p>
        <form onSubmit={submit} className="booking-api-form">
          <label>Dịch vụ / gói khám<select required value={form.serviceId} onChange={(event) => update('serviceId', event.target.value)}><option value="">Chọn dịch vụ</option>{services.map((service) => <option key={service.id ?? service.dichvuid} value={service.id ?? service.dichvuid}>{service.name || service.tendichvu}</option>)}</select></label>
          <label>Bác sĩ<select required value={form.doctorId} onChange={(event) => update('doctorId', event.target.value)}><option value="">Chọn bác sĩ</option>{doctors.map((doctor) => <option key={doctor.bacsiid ?? doctor.id} value={doctor.bacsiid ?? doctor.id}>{doctor.hoten || doctor.name}{doctor.tenchuyenkhoa || doctor.specialty ? ` · ${doctor.tenchuyenkhoa || doctor.specialty}` : ''}</option>)}</select></label>
          <div className="booking-api-row"><label>Ngày khám<input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(event) => update('date', event.target.value)} /></label><label>Giờ khám<select value={form.time} onChange={(event) => update('time', event.target.value)}>{['08:00', '09:00', '10:30', '14:00', '15:30', '16:30'].map((time) => <option key={time}>{time}</option>)}</select></label></div>
          <div className="booking-api-row"><label>Họ tên<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label>Số điện thoại<input required value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label></div>
          <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label>Lý do khám / triệu chứng<textarea value={form.reason} onChange={(event) => update('reason', event.target.value)} /></label>
          {selectedDoctor ? <p className="booking-api-doctor">Bác sĩ đã chọn: <strong>{selectedDoctor.hoten || selectedDoctor.name}</strong></p> : null}
          {selectedService ? <p className="booking-api-doctor">Dịch vụ đã chọn: <strong>{selectedService.name || selectedService.tendichvu}</strong></p> : null}
          {message ? <p className={message.includes('ghi nhận') ? 'form-success' : 'form-error'}>{message}</p> : null}
          <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Xác nhận đặt lịch'}</button>
        </form>
      </div>
    </main>
  );
}
