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
const THEME_STORAGE_KEY = 'bta_theme';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: { token: string; user: any }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function normalizeRole(role: string) {
  return String(role || '').trim().toLowerCase();
}

function getSessionUserId(session = readStoredSession()) {
  return session?.user?.UserID ?? session?.user?.userid ?? session?.user?.id ?? null;
}

function getRoleDashboardPath(user: any) {
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
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const userId = getSessionUserId(session);

  if (userId !== null) {
    headers['x-user-id'] = String(userId);
  }

  return headers;
}

type Doctor = {
  id?: number;
  name: string;
  specialty: string;
  experience: string;
  description: string;
};

type Service = {
  id?: number;
  name: string;
  description: string;
  price: number;
};

function RoleDashboardPage({ title, subtitle, apiPath, renderData }: {
  title: string;
  subtitle: string;
  apiPath: string;
  renderData: (data: any) => React.ReactNode;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
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
    <main className="page-shell">
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
      title="Trang Quản Trị Hệ Thống"
      subtitle="Theo dõi tổng quan và quản lý nhanh các danh mục bệnh viện"
      apiPath="/api/admin/dashboard"
      renderData={(data) => {
        const totalUsers = data?.stats?.totalUsers ?? 5;
        const totalDoctors = data?.stats?.totalDoctors ?? 2;
        const totalPatients = data?.stats?.totalPatients ?? 5;
        const totalAppointments = data?.stats?.totalAppointments ?? 6;

        return (
          <div className="space-y-6">
            {/* Thống kê dạng Card trực quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="panel bg-gradient-to-br from-sky-500 to-sky-600 text-white p-5 rounded-xl shadow">
                <p className="text-sm opacity-80">Tổng người dùng</p>
                <h3 className="text-3xl font-bold mt-1">{totalUsers}</h3>
              </div>
              <div className="panel bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 rounded-xl shadow">
                <p className="text-sm opacity-80">Tổng bác sĩ</p>
                <h3 className="text-3xl font-bold mt-1">{totalDoctors}</h3>
              </div>
              <div className="panel bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-5 rounded-xl shadow">
                <p className="text-sm opacity-80">Tổng bệnh nhân</p>
                <h3 className="text-3xl font-bold mt-1">{totalPatients}</h3>
              </div>
              <div className="panel bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-xl shadow">
                <p className="text-sm opacity-80">Tổng lịch khám</p>
                <h3 className="text-3xl font-bold mt-1">{totalAppointments}</h3>
              </div>
            </div>

            {/* Menu quản lý và Thông tin quản trị */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="panel">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Thông tin tài khoản quản trị</h3>
                <p><strong>Họ tên:</strong> {data?.user?.HoTen || data?.user?.hoten || 'Admin'}</p>
                <p><strong>Email:</strong> {data?.user?.Email || data?.user?.email || 'admin@gmail.com'}</p>
                <p><strong>Vai trò:</strong> <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-xs font-bold">Quản Trị</span></p>
              </div>

              <div className="panel">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Quản lý chuyên nhanh</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/doctors" className="btn btn-secondary text-center">📋 Quản lý danh sách Bác sĩ</Link>
                  <Link to="/services" className="btn btn-secondary text-center">🩺 Quản lý dịch vụ Y tế</Link>
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
      title="Trang Bác Sĩ"
      subtitle="Xem thông tin chuyên môn và lịch khám của bạn"
      apiPath="/api/doctor/dashboard"
      renderData={(data) => (
        <div className="list-grid">
          <div className="panel">
            <h3>Thông tin bác sĩ</h3>
            <p><strong>Họ tên:</strong> {data?.user?.HoTen || data?.user?.hoten || '---'}</p>
            <p><strong>Chuyên khoa:</strong> {data?.doctor?.TenChuyenKhoa || data?.doctor?.tenchuyenkhoa || '---'}</p>
            <p><strong>Kinh nghiệm:</strong> {data?.doctor?.KinhNghiem || data?.doctor?.kinhnghiem || '---'}</p>
          </div>

          <div className="panel">
            <h3>Lịch khám gần đây</h3>
            {(data?.appointments || []).length === 0 ? (
              <p>Chưa có lịch khám nào.</p>
            ) : (
              <ul>
                {(data?.appointments || []).map((item: any, index: number) => (
                  <li key={item.LichKhamID ?? item.lichkhamid ?? index}>
                    {item.ThoiGianKham || item.thoigiankham || '---'} - {item.TrangThai || item.trangthai || '---'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    />
  );
}

function PatientDashboardPage() {
  return (
    <RoleDashboardPage
      title="Trang Bệnh Nhân"
      subtitle="Theo dõi hồ sơ và lịch khám cá nhân"
      apiPath="/api/patient/profile"
      renderData={(data) => (
        <div className="list-grid">
          <div className="panel">
            <h3>Thông tin cá nhân</h3>
            <p><strong>Họ tên:</strong> {data?.user?.HoTen || data?.user?.hoten || '---'}</p>
            <p><strong>Email:</strong> {data?.user?.Email || data?.user?.email || '---'}</p>
            <p><strong>Giới tính:</strong> {data?.patient?.GioiTinh || data?.patient?.gioitinh || '---'}</p>
            <p><strong>Ngày sinh:</strong> {data?.patient?.NgaySinh || data?.patient?.ngaysinh || '---'}</p>
          </div>

          <div className="panel">
            <h3>Lịch khám của bạn</h3>
            {(data?.appointments || []).length === 0 ? (
              <p>Chưa có lịch khám nào.</p>
            ) : (
              <ul>
                {(data?.appointments || []).map((item: any, index: number) => (
                  <li key={item.LichKhamID ?? item.lichkhamid ?? index}>
                    {item.ThoiGianKham || item.thoigiankham || '---'} - {item.TrangThai || item.trangthai || '---'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      setMessage(error instanceof Error ? error.message : 'Đăng nhập thất bại.');
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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const session = readStoredSession();
  const role = normalizeRole(session?.user?.VaiTro || session?.user?.vaitro || '');
  const isLoggedIn = Boolean(session?.token);

  useEffect(() => {
    fetch(`${API_BASE}/api/doctors`)
      .then((res) => res.json())
      .then((data: Doctor[]) => {
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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const session = readStoredSession();
  const role = normalizeRole(session?.user?.VaiTro || session?.user?.vaitro || '');
  const isLoggedIn = Boolean(session?.token);

  useEffect(() => {
    fetch(`${API_BASE}/api/services`)
      .then((res) => res.json())
      .then((data: Service[]) => {
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      setMessage(error instanceof Error ? error.message : 'Đăng ký thất bại.');
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
  const [session, setSession] = useState<{ token?: string; user?: any } | null>(() => readStoredSession());
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  });

  const isLoggedIn = Boolean(session?.token);
  const userName = session?.user?.HoTen || session?.user?.hoten || 'Tài khoản';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    window.location.href = '/';
  };

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <header className="topbar">
        <div className="brand">Bệnh viện Tâm An</div>
        <nav>
          <Link to="/">Trang chủ</Link>
          <Link to="/doctors">Bác sĩ</Link>
          <Link to="/services">Dịch vụ</Link>
          <Link to="/contact">Liên hệ</Link>

          <button
            type="button"
            className="btn btn-secondary small-btn"
            onClick={toggleTheme}
            title="Chuyển đổi giao diện sáng/tối"
          >
            {theme === 'light' ? '🌙 Tối' : '☀️ Sáng'}
          </button>

          {isLoggedIn ? (
            <>
              <span className="user-badge">Xin chào, {userName}</span>
              <button type="button" className="btn btn-secondary small-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login">Đăng nhập</Link>
          )}
        </nav>
      </header>

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
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root') as HTMLElement | null;

if (!rootElement) {
  throw new Error('Không tìm thấy phần tử #root để render ứng dụng.');
}

const appRoot = (rootElement as any).__bta_root ?? ((rootElement as any).__bta_root = ReactDOM.createRoot(rootElement));

appRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
