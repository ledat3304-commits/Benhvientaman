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

export function AdminDashboardPage() {
  const session = readSession();
  const [notifications, setNotifications] = useState<Record<string, any>[]>([]);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!session?.token && !session?.user) {
      setLoading(false);
      setError('Phiên đăng nhập admin không tồn tại.');
      return;
    }

    try {
      const headers = authHeaders(session);
      const [dashboardResponse, notificationsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/admin/dashboard`, { headers }),
        fetch(`${API_BASE}/api/admin/notifications?limit=50`, { headers })
      ]);
      const dashboard = await dashboardResponse.json();
      const notificationData = await notificationsResponse.json();

      if (!dashboardResponse.ok) throw new Error(dashboard.message || 'Không thể tải dữ liệu quản trị.');
      if (!notificationsResponse.ok) throw new Error(notificationData.message || 'Không thể tải thông báo.');

      setStats(dashboard.stats || {});
      setNotifications(notificationData.notifications || []);
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

  const markAsRead = async (notificationId: string | number) => {
    const response = await fetch(`${API_BASE}/api/admin/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: authHeaders(session)
    });
    if (response.ok) {
      setNotifications((items) => items.map((item) => (
        String(getValue(item, 'thongbaoid', 'ThongBaoID')) === String(notificationId)
          ? { ...item, dadoc: true, DaDoc: true }
          : item
      )));
    }
  };

  return (
    <main className="admin-notification-page">
      <div className="admin-notification-container">
        <div className="admin-notification-header">
          <div>
            <span className="eyebrow">Khu vực quản trị</span>
            <h1>Thông tin gửi về tài khoản admin</h1>
            <p>{getValue(session?.user || {}, 'HoTen', 'hoten') || 'Quản trị viên'} · {getValue(session?.user || {}, 'Email', 'email')}</p>
          </div>
          <a className="button button-outline" href="/">Về trang chủ</a>
        </div>

        {loading ? <p className="admin-notification-state">Đang tải thông báo...</p> : null}
        {error ? <p className="admin-notification-error">{error}</p> : null}

        <div className="admin-stat-grid">
          <div><span>Tổng người dùng</span><strong>{stats.totalUsers ?? 0}</strong></div>
          <div><span>Tổng bệnh nhân</span><strong>{stats.totalPatients ?? 0}</strong></div>
          <div><span>Tổng lịch khám</span><strong>{stats.totalAppointments ?? 0}</strong></div>
          <div><span>Chưa đọc</span><strong>{stats.unreadNotifications ?? notifications.filter((item) => !getValue(item, 'dadoc', 'DaDoc')).length}</strong></div>
        </div>

        <section className="admin-notification-panel">
          <div className="admin-notification-panel-heading">
            <div><span className="eyebrow">Hộp thư hệ thống</span><h2>Thông báo mới nhất</h2></div>
            <button className="button button-outline" type="button" onClick={() => loadData()}>Làm mới</button>
          </div>
          {notifications.length === 0 && !loading ? <p className="admin-notification-state">Chưa có thông báo mới.</p> : null}
          <div className="admin-notification-list">
            {notifications.map((item, index) => {
              const id = getValue(item, 'thongbaoid', 'ThongBaoID') || index;
              const isRead = Boolean(getValue(item, 'dadoc', 'DaDoc'));
              return (
                <article className={isRead ? 'admin-notification-item' : 'admin-notification-item is-unread'} key={id}>
                  <div>
                    <strong>{getValue(item, 'tieude', 'TieuDe') || 'Thông báo hệ thống'}</strong>
                    <p>{getValue(item, 'noidung', 'NoiDung')}</p>
                    <small>{getValue(item, 'ngaytao', 'NgayTao') ? new Date(getValue(item, 'ngaytao', 'NgayTao')).toLocaleString('vi-VN') : ''}</small>
                  </div>
                  {!isRead && <button type="button" onClick={() => markAsRead(id)}>Đánh dấu đã đọc</button>}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

type Doctor = { bacsiid?: number; id?: number; hoten?: string; name?: string; tenchuyenkhoa?: string; specialty?: string };

export function BookingPageApi() {
  const session = readSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '09:00', name: '', phone: '', email: '', reason: '' });
  const [message, setMessage] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/doctors`)
      .then((response) => response.json())
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => setDoctors([]));
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
          <label>Bác sĩ<select required value={form.doctorId} onChange={(event) => update('doctorId', event.target.value)}><option value="">Chọn bác sĩ</option>{doctors.map((doctor) => <option key={doctor.bacsiid ?? doctor.id} value={doctor.bacsiid ?? doctor.id}>{doctor.hoten || doctor.name}{doctor.tenchuyenkhoa || doctor.specialty ? ` · ${doctor.tenchuyenkhoa || doctor.specialty}` : ''}</option>)}</select></label>
          <div className="booking-api-row"><label>Ngày khám<input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(event) => update('date', event.target.value)} /></label><label>Giờ khám<select value={form.time} onChange={(event) => update('time', event.target.value)}>{['08:00', '09:00', '10:30', '14:00', '15:30', '16:30'].map((time) => <option key={time}>{time}</option>)}</select></label></div>
          <div className="booking-api-row"><label>Họ tên<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label>Số điện thoại<input required value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label></div>
          <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label>Lý do khám / triệu chứng<textarea value={form.reason} onChange={(event) => update('reason', event.target.value)} /></label>
          {selectedDoctor ? <p className="booking-api-doctor">Bác sĩ đã chọn: <strong>{selectedDoctor.hoten || selectedDoctor.name}</strong></p> : null}
          {message ? <p className={message.includes('ghi nhận') ? 'form-success' : 'form-error'}>{message}</p> : null}
          <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Xác nhận đặt lịch'}</button>
        </form>
      </div>
    </main>
  );
}
