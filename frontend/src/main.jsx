import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './styles.css';

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : 'https://benhvientaman.onrender.com')
).replace(/\/$/, '');

const STORAGE_KEY = 'bta_session';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

function getSessionUserId(session = readStoredSession()) {
  return session?.user?.UserID ?? session?.user?.userid ?? session?.user?.id ?? null;
}

function getRoleDashboardPath(user) {
  const role = normalizeRole(user?.VaiTro || user?.vaitro || '');

  if (role.includes('quantri') || role.includes('admin') || role.includes('quanly')) {
    return '/admin';
  }

  if (role.includes('bacsi') || role.includes('doctor')) {
    return '/doctor';
  }

  if (role.includes('benhnhan') || role.includes('patient')) {
    return '/patient';
  }

  return '/';
}

function getSessionHeaders(session = readStoredSession()) {
  const headers = { 'Content-Type': 'application/json' };
  const userId = getSessionUserId(session);

  if (userId !== null) {
    headers['x-user-id'] = String(userId);
  }

  return headers;
}

function getDashboardTheme(apiPath) {
  if (String(apiPath || '').includes('/admin/')) return 'theme-admin';
  if (String(apiPath || '').includes('/doctor/')) return 'theme-doctor';
  if (String(apiPath || '').includes('/patient/')) return 'theme-patient';
  return 'theme-admin';
}

function RoleDashboardPage({ title, subtitle, apiPath, renderData, emptyMessage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const session = readStoredSession();

  useEffect(() => {
    if (!session?.token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}${apiPath}`, {
      method: 'GET',
      headers: getSessionHeaders(session)
    })
      .then(async (res) => {
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.message || 'Không thể tải dữ liệu.');
        }

        return payload;
      })
      .then((payload) => {
        setData(payload);
        setError('');
      })
      .catch((fetchError) => {
        setError(fetchError.message || 'Không thể tải dữ liệu.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiPath, session?.token]);

  if (!session?.token) {
    return (
      <main className="page-shell centered">
        <div className="panel">
          <h2>{title}</h2>
          <p>Bạn cần đăng nhập để xem trang này.</p>
          <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`page-shell ${getDashboardTheme(apiPath)}`}>
      <div className="section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <div className="panel">
          <p className="form-message">{error}</p>
        </div>
      ) : (
        renderData(data || {})
      )}
    </main>
  );
}

function AdminDashboardPage() {
  return (
    <RoleDashboardPage
      title="Trang quản trị"
      subtitle="Theo dõi tổng quan hệ thống bệnh viện"
      apiPath="/api/admin/dashboard"
      renderData={(data) => {
        const stats = [
          { label: 'Tổng người dùng', value: data?.stats?.totalUsers ?? 0, icon: '👥', tone: 'blue', trend: '+8%' },
          { label: 'Tổng bác sĩ', value: data?.stats?.totalDoctors ?? 0, icon: '🩺', tone: 'green', trend: '+3%' },
          { label: 'Tổng bệnh nhân', value: data?.stats?.totalPatients ?? 0, icon: '🧑‍⚕️', tone: 'gold', trend: '+12%' },
          { label: 'Tổng lịch khám', value: data?.stats?.totalAppointments ?? 0, icon: '📅', tone: 'purple', trend: '+5%' }
        ];

        const quickActions = [
          'Quản lý bác sĩ',
          'Quản lý bệnh nhân',
          'Sửa danh mục dịch vụ',
          'Xuất báo cáo nhanh'
        ];

        const alerts = [
          { title: 'Lịch khám hôm nay', text: 'Có 12 lịch khám cần xác nhận.' },
          { title: 'Hệ thống', text: 'Phần mềm đang hoạt động ổn định.' },
          { title: 'Dịch vụ', text: '2 danh mục đang cần cập nhật giá mới.' }
        ];

        const chartData = [
          { label: 'T1', value: 35 },
          { label: 'T2', value: 50 },
          { label: 'T3', value: 44 },
          { label: 'T4', value: 70 },
          { label: 'T5', value: 64 },
          { label: 'T6', value: 82 },
          { label: 'T7', value: 78 }
        ];

        return (
          <div className="dashboard-shell">
            <div className="dashboard-header panel">
              <div className="heading-block">
                <span className="eyebrow dark">Tổng quan hệ thống</span>
                <h2>Chào mừng trở lại, {data?.user?.HoTen || data?.user?.hoten || 'Quản trị viên'}</h2>
                <p>Hiện tại hệ thống đang theo dõi tình trạng hoạt động và lịch khám trong ngày.</p>
              </div>

              <div className="header-actions">
                <button className="btn btn-primary small-btn">Thêm bác sĩ</button>
                <button className="btn btn-secondary small-btn">Xuất báo cáo</button>
              </div>
            </div>

            <div className="stats-grid">
              {stats.map((item) => (
                <div className={`stat-card ${item.tone}`} key={item.label}>
                  <div className="stat-top">
                    <div className="stat-icon">{item.icon}</div>
                    <span className="stat-trend">{item.trend}</span>
                  </div>
                  <div className="stat-label">{item.label}</div>
                  <div className="stat-value">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="chart-grid">
              <div className="panel chart-panel">
                <div className="panel-header">
                  <h3>Xu hướng lịch khám</h3>
                  <span className="chip success">+18%</span>
                </div>

                <div className="chart-bars">
                  {chartData.map((item) => (
                    <div className="chart-column" key={item.label}>
                      <span className="chart-value">{item.value}</span>
                      <div className="chart-bar" style={{ height: `${item.value}%` }} />
                      <span className="chart-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel summary-panel">
                <div className="panel-header">
                  <h3>Phân bố hoạt động</h3>
                </div>

                <div className="legend-list">
                  <div className="legend-item">
                    <span className="legend-swatch blue" />
                    <span>Khám bệnh</span>
                    <strong>42%</strong>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch green" />
                    <span>Điều trị</span>
                    <strong>31%</strong>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch orange" />
                    <span>Chăm sóc</span>
                    <strong>17%</strong>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch purple" />
                    <span>Khác</span>
                    <strong>10%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <div className="panel-header">
                  <h3>Hoạt động gần đây</h3>
                  <span className="chip success">Đang hoạt động</span>
                </div>

                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-dot blue" />
                    <div>
                      <strong>Người dùng mới</strong>
                      <p>6 bệnh nhân đã đăng ký tài khoản trong 24 giờ qua.</p>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-dot green" />
                    <div>
                      <strong>Lịch khám xác nhận</strong>
                      <p>12 lịch khám đã được bác sĩ xác nhận và gửi SMS cho bệnh nhân.</p>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-dot gold" />
                    <div>
                      <strong>Cập nhật dịch vụ</strong>
                      <p>2 dịch vụ y tế đã được chỉnh sửa đơn giá theo quy định mới.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="side-stack">
                <div className="panel">
                  <div className="panel-header">
                    <h3>Hành động nhanh</h3>
                  </div>

                  <div className="action-list">
                    {quickActions.map((action, index) => (
                      <button key={action} className="action-item" type="button">
                        <span className="action-order">0{index + 1}</span>
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Cảnh báo hệ thống</h3>
                  </div>

                  <div className="alert-list">
                    {alerts.map((item) => (
                      <div className="alert-item" key={item.title}>
                        <strong>{item.title}</strong>
                        <p>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

function DoctorDashboardPage() {
  return (
    <RoleDashboardPage
      title="Trang bác sĩ"
      subtitle="Xem thông tin và lịch khám của bạn"
      apiPath="/api/doctor/dashboard"
      renderData={(data) => {
        const appointments = data?.appointments || [];
        const stats = [
          { label: 'Lịch trong tuần', value: appointments.length || 0, tone: 'blue', icon: '📅' },
          { label: 'Đã xác nhận', value: appointments.filter((item) => (item.TrangThai || item.trangthai || '').toLowerCase().includes('xacnhan')).length || 0, tone: 'green', icon: '✅' },
          { label: 'Chờ phản hồi', value: appointments.filter((item) => (item.TrangThai || item.trangthai || '').toLowerCase().includes('cho')).length || 0, tone: 'gold', icon: '⏳' }
        ];

        return (
          <div className="dashboard-shell">
            <div className="dashboard-header panel">
              <div className="heading-block">
                <span className="eyebrow dark">Bác sĩ</span>
                <h2>{data?.user?.HoTen || data?.user?.hoten || 'Bác sĩ'}</h2>
                <p>Quản lý lịch khám, theo dõi bệnh nhân và cập nhật hồ sơ điều trị.</p>
              </div>

              <div className="header-actions">
                <button className="btn btn-primary small-btn">+ Tạo lịch làm việc</button>
              </div>
            </div>

            <div className="stats-grid compact-grid">
              {stats.map((item) => (
                <div className={`stat-card ${item.tone}`} key={item.label}>
                  <div className="stat-top">
                    <div className="stat-icon">{item.icon}</div>
                  </div>
                  <div className="stat-label">{item.label}</div>
                  <div className="stat-value">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="content-grid">
              <div className="panel">
                <div className="panel-header">
                  <h3>Thông tin bác sĩ</h3>
                  <span className="chip success">Đang làm việc</span>
                </div>

                <div className="profile-grid">
                  <div className="info-tile">
                    <span className="info-label">Họ tên</span>
                    <strong>{data?.user?.HoTen || data?.user?.hoten || '---'}</strong>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Chuyên khoa</span>
                    <strong>{data?.doctor?.TenChuyenKhoa || data?.doctor?.tenchuyenkhoa || '---'}</strong>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Kinh nghiệm</span>
                    <strong>{data?.doctor?.KinhNghiem || data?.doctor?.kinhnghiem || '---'}</strong>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Email</span>
                    <strong>{data?.user?.Email || data?.user?.email || '---'}</strong>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Nhắc nhở</h3>
                </div>

                <div className="alert-list">
                  <div className="alert-item">
                    <strong>Buổi sáng</strong>
                    <p>3 bệnh nhân cần xác nhận lịch khám trước 9:00.</p>
                  </div>
                  <div className="alert-item">
                    <strong>Hồ sơ</strong>
                    <p>2 hồ sơ bệnh án chưa được cập nhật kết quả.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Lịch khám gần đây</h3>
              </div>

              <div className="appointment-list">
                {appointments.length === 0 ? (
                  <p>Chưa có lịch khám nào.</p>
                ) : (
                  appointments.map((item, index) => (
                    <div className="appointment-item" key={item.LichKhamID ?? item.lichkhamid ?? index}>
                      <div>
                        <strong>{item.ThoiGianKham || item.thoigiankham || '---'}</strong>
                        <p>{item.LyDoKham || item.lydokham || 'Không có lý do khám'}</p>
                      </div>
                      <span className="chip status-chip">
                        {item.TrangThai || item.trangthai || '---'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

function PatientDashboardPage() {
  return (
    <RoleDashboardPage
      title="Trang bệnh nhân"
      subtitle="Theo dõi hồ sơ và lịch khám của bạn"
      apiPath="/api/patient/profile"
      renderData={(data) => {
        const appointments = data?.appointments || [];
        const stats = [
          { label: 'Lịch đã đặt', value: appointments.length || 0, tone: 'blue', icon: '📋' },
          { label: 'Đã hoàn tất', value: appointments.filter((item) => (item.TrangThai || item.trangthai || '').toLowerCase().includes('hoanthanh')).length || 0, tone: 'green', icon: '✅' },
          { label: 'Đang chờ', value: appointments.filter((item) => (item.TrangThai || item.trangthai || '').toLowerCase().includes('xacnhan')).length || 0, tone: 'gold', icon: '🕒' }
        ];

        return (
          <div className="dashboard-shell">
            <div className="dashboard-header panel">
              <div className="heading-block">
                <span className="eyebrow dark">Bệnh nhân</span>
                <h2>{data?.user?.HoTen || data?.user?.hoten || 'Bệnh nhân'}</h2>
                <p>Theo dõi hồ sơ sức khỏe, lịch khám và nhận thông báo từ bác sĩ.</p>
              </div>

              <div className="header-actions">
                <button className="btn btn-primary small-btn">Đặt lịch mới</button>
              </div>
            </div>

            <div className="stats-grid compact-grid">
              {stats.map((item) => (
                <div className={`stat-card ${item.tone}`} key={item.label}>
                  <div className="stat-top">
                    <div className="stat-icon">{item.icon}</div>
                  </div>
                  <div className="stat-label">{item.label}</div>
                  <div className="stat-value">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="content-grid">
              <div className="panel">
                <div className="panel-header">
                  <h3>Thông tin bệnh nhân</h3>
                  <span className="chip success">Tài khoản đang hoạt động</span>
                </div>

                <div className="profile-grid">
                  <div className="info-tile">
                    <span className="info-label">Họ tên</span>
                    <strong>{data?.user?.HoTen || data?.user?.hoten || '---'}</strong>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Email</span>
                    <strong>{data?.user?.Email || data?.user?.email || '---'}</strong>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Giới tính</span>
                    <strong>{data?.patient?.GioiTinh || data?.patient?.gioitinh || '---'}</strong>
                  </div>
                  <div className="info-tile">
                    <span className="info-label">Ngày sinh</span>
                    <strong>{data?.patient?.NgaySinh || data?.patient?.ngaysinh || '---'}</strong>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Sức khỏe</h3>
                </div>

                <div className="alert-list">
                  <div className="alert-item">
                    <strong>Tiền sử</strong>
                    <p>{data?.profile?.ThongTin || 'Không có thông tin y tế đáng chú ý.'}</p>
                  </div>
                  <div className="alert-item">
                    <strong>Hướng dẫn</strong>
                    <p>Nhắc nhở uống thuốc đúng giờ và theo dõi các triệu chứng mới.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Lịch khám của bạn</h3>
              </div>

              <div className="appointment-list">
                {appointments.length === 0 ? (
                  <p>Chưa có lịch khám nào.</p>
                ) : (
                  appointments.map((item, index) => (
                    <div className="appointment-item" key={item.LichKhamID ?? item.lichkhamid ?? index}>
                      <div>
                        <strong>{item.ThoiGianKham || item.thoigiankham || '---'}</strong>
                        <p>{item.LyDoKham || item.lydokham || 'Chưa có thông tin'}</p>
                      </div>
                      <span className="chip status-chip">
                        {item.TrangThai || item.trangthai || '---'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

function HomePage() {
  const session = readStoredSession();
  const role = normalizeRole(session?.user?.VaiTro || session?.user?.vaitro || '');
  const isLoggedIn = Boolean(session?.token);
  const primaryActionText = isLoggedIn
    ? (role.includes('quantri') ? 'Vào quản trị' : role.includes('bacsi') ? 'Xem lịch khám' : 'Đặt lịch khám ngay')
    : 'Đặt lịch khám ngay';
  const primaryActionPath = isLoggedIn ? getRoleDashboardPath(session?.user) : '/login';

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Bệnh viện Tâm An</p>
          <h1>Chào Mừng Đến Với Bệnh Viện Tâm An</h1>
          <p>
            Hệ thống chăm sóc sức khỏe toàn diện với đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm,
            trang thiết bị hiện đại và dịch vụ hỗ trợ bệnh nhân tận tâm.
          </p>
          <div className="cta-row">
            <Link to={primaryActionPath} className="btn btn-primary">{primaryActionText}</Link>
            <Link to="/services" className="btn btn-secondary">Xem dịch vụ</Link>
          </div>
        </div>
      </section>

      <section className="cards">
        <div className="card">
          <div className="icon-circle primary">👨‍⚕️</div>
          <h3>Đội Ngũ Chuyên Gia</h3>
          <p>Quy tụ các bác sĩ đầu ngành, tận tâm và giàu kinh nghiệm trực tiếp khám chữa bệnh.</p>
          <Link to="/doctors" className="text-link">Tìm hiểu thêm →</Link>
        </div>

        <div className="card">
          <div className="icon-circle blue">🩺</div>
          <h3>Dịch Vụ Chất Lượng</h3>
          <p>Cung cấp đầy đủ gói khám tổng quát, chuyên khoa với chi phí minh bạch, hợp lý.</p>
          <Link to="/services" className="text-link">Xem chi tiết →</Link>
        </div>

        <div className="card">
          <div className="icon-circle gold">📞</div>
          <h3>Hỗ Trợ 24/7</h3>
          <p>Đội ngũ tư vấn trực tuyến hỗ trợ đặt lịch nhanh chóng, không phải chờ đợi lâu.</p>
          <Link to="/contact" className="text-link">Liên hệ ngay →</Link>
        </div>
      </section>
    </main>
  );
}

function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Đăng nhập thất bại.');
      }

      saveSession({ token: data.token, user: data.user });
      setMessage('Đăng nhập thành công!');
      window.location.href = getRoleDashboardPath(data.user);
    } catch (error) {
      setMessage(error.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell centered">
      <div className="panel login-panel">
        <div className="login-header">
          <div className="login-icon">🛡️</div>
          <h2>Đăng Nhập Hệ Thống</h2>
          <p>Cổng thông tin Bệnh viện Tâm An</p>
        </div>

        <div className="login-body">
          <form onSubmit={handleSubmit}>
            <label>
              Email hoặc Số điện thoại
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="nhap@email.com hoặc 090..."
              />
            </label>

            <label>
              Mật khẩu
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </label>

            <div className="row-between">
              <label className="checkbox-label">
                <input type="checkbox" />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/contact" className="text-link small">Quên mật khẩu?</Link>
            </div>

            {message && <p className="form-message">{message}</p>}

            <button type="submit" className="btn btn-primary full-width" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>

            <div className="signup-row">
              <span>Chưa có tài khoản?</span>
              <Link to="/register" className="text-link">Đăng ký ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const session = readStoredSession();
  const role = normalizeRole(session?.user?.VaiTro || session?.user?.vaitro || '');
  const isLoggedIn = Boolean(session?.token);

  useEffect(() => {
    fetch(`${API_BASE}/api/doctors`)
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(() => {
        setDoctors([]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="page-shell">
      <div className="section-header">
        <h2>Đội Ngũ Bác Sĩ</h2>
        <p>Đội ngũ chuyên gia, bác sĩ giàu kinh nghiệm tại Bệnh viện Tâm An</p>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="list-grid">
          {doctors.map((doctor, index) => (
            <div className="doctor-card" key={doctor.id ?? index}>
              <div className="avatar">{index + 1}</div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <span className="badge">{doctor.specialty}</span>
                <p>
                  <strong>Kinh nghiệm:</strong> {doctor.experience}
                </p>
                <p>{doctor.description}</p>
              </div>
              <div className="doctor-footer">
                <Link
                  to={isLoggedIn ? getRoleDashboardPath(session?.user) : '/login'}
                  className="btn btn-secondary"
                >
                  {isLoggedIn ? (role.includes('quantri') ? 'Vào quản trị' : role.includes('bacsi') ? 'Xem lịch khám' : 'Đặt lịch khám') : 'Đặt lịch khám'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const session = readStoredSession();
  const role = normalizeRole(session?.user?.VaiTro || session?.user?.vaitro || '');
  const isLoggedIn = Boolean(session?.token);

  useEffect(() => {
    fetch(`${API_BASE}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        setServices([]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="page-shell">
      <div className="section-header">
        <h2>Dịch Vụ Y Tế</h2>
        <p>Các dịch vụ khám chữa bệnh chất lượng cao tại Bệnh viện Tâm An</p>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="list-grid services-grid">
          {services.map((service) => (
            <div className="service-card" key={service.id}>
              <div className="service-header">
                <div className="service-icon">🩺</div>
                <h3>{service.name}</h3>
              </div>
              <p>{service.description}</p>
              <div className="service-footer">
                <span>{service.price.toLocaleString('vi-VN')} VNĐ</span>
                <Link
                  to={isLoggedIn ? getRoleDashboardPath(session?.user) : '/login'}
                  className="btn btn-secondary small-btn"
                >
                  {isLoggedIn ? (role.includes('quantri') ? 'Quản lý dịch vụ' : role.includes('bacsi') ? 'Xem dịch vụ' : 'Đăng ký ngay') : 'Đăng ký ngay'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function ContactPage() {
  return (
    <main className="page-shell">
      <div className="section-header">
        <h2>Liên Hệ</h2>
        <p>Thông tin liên hệ của Bệnh viện Tâm An</p>
      </div>
      <div className="panel contact-box">
        <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM</p>
        <p><strong>Email:</strong> contact@benhvientaman.vn</p>
        <p><strong>Điện thoại:</strong> 0909 123 456</p>
      </div>
    </main>
  );
}

function RegisterPage() {
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SoDienThoai: '',
    MatKhau: '',
    confirm_password: '',
    GioiTinh: 'Nam'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Đăng ký thất bại.');
      }

      setMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      setFormData({
        HoTen: '',
        Email: '',
        SoDienThoai: '',
        MatKhau: '',
        confirm_password: '',
        GioiTinh: 'Nam'
      });
    } catch (error) {
      setMessage(error.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell centered">
      <div className="panel">
        <h2>Đăng ký tài khoản</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Họ và tên
            <input
              type="text"
              name="HoTen"
              value={formData.HoTen}
              onChange={handleChange}
              placeholder="Nhập họ tên"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
          </label>
          <label>
            Số điện thoại
            <input
              type="text"
              name="SoDienThoai"
              value={formData.SoDienThoai}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </label>
          <label>
            Giới tính
            <select name="GioiTinh" value={formData.GioiTinh} onChange={handleChange}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              name="MatKhau"
              value={formData.MatKhau}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
            />
          </label>
          <label>
            Xác nhận mật khẩu
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
            />
          </label>
          {message && <p className="form-message">{message}</p>}
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(() => readStoredSession());
  const isLoggedIn = Boolean(session?.token);
  const userName = session?.user?.HoTen || session?.user?.hoten || 'Tài khoản';

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    window.location.href = '/';
  };

  const dashboardPath = isLoggedIn ? getRoleDashboardPath(session?.user) : '/login';
  const navItems = [
    { to: '/', label: 'Trang chủ', icon: '🏠' },
    { to: '/doctors', label: 'Bác sĩ', icon: '👨‍⚕️' },
    { to: '/services', label: 'Dịch vụ', icon: '🩺' },
    { to: '/contact', label: 'Liên hệ', icon: '📞' },
  ];

  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-mark">+</span>
            <span>Bệnh viện Tâm An</span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-item"
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {isLoggedIn && (
              <Link to={dashboardPath} className="nav-item active">
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          <div className="sidebar-footer">
            {isLoggedIn ? (
              <>
                <div className="user-card">
                  <div className="user-avatar">{userName?.charAt(0)?.toUpperCase() || 'U'}</div>
                  <div>
                    <strong>{userName}</strong>
                    <span>{session?.user?.VaiTro || session?.user?.vaitro || 'Người dùng'}</span>
                  </div>
                </div>
                <button type="button" className="btn btn-secondary full-width" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary full-width">Đăng nhập</Link>
            )}
          </div>
        </aside>

        <div className="content-shell">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/doctor" element={<DoctorDashboardPage />} />
            <Route path="/patient" element={<PatientDashboardPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Không tìm thấy phần tử #root để render ứng dụng.');
}

const appRoot = rootElement.__bta_root || (rootElement.__bta_root = ReactDOM.createRoot(rootElement));

appRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
