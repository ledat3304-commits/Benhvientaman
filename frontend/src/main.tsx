import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
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

function normalizeRole(role: unknown) {
  return String(role || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[\u0111\u0110]/g, 'd')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function getSessionUserId(session = readStoredSession()) {
  return session?.user?.UserID ?? session?.user?.userid ?? session?.user?.id ?? null;
}

type AppRole = 'admin' | 'doctor' | 'patient' | '';

function getUserRole(user: any): AppRole {
  const role = normalizeRole(user?.VaiTro || user?.vaitro || '');

  if (['quantri', 'quantrivien', 'quanly', 'admin', 'administrator'].includes(role)) {
    return 'admin';
  }

  if (['bacsi', 'doctor'].includes(role)) {
    return 'doctor';
  }

  if (['benhnhan', 'patient'].includes(role)) {
    return 'patient';
  }

  return '';
}

function getRoleDashboardPath(user: any) {
  const rolePaths: Record<Exclude<AppRole, ''>, string> = {
    admin: '/admin',
    doctor: '/doctor',
    patient: '/patient'
  };
  const role = getUserRole(user);
  return role ? rolePaths[role] : '/';
}

function RoleRoute({ role, children }: { role: Exclude<AppRole, ''>; children: React.ReactElement }) {
  const session = readStoredSession();

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  if (getUserRole(session.user) !== role) {
    return <Navigate to={getRoleDashboardPath(session.user)} replace />;
  }

  return children;
}

function getSessionHeaders(session = readStoredSession()) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

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
      title="Trang quản trị"
      subtitle="Theo dõi tổng quan hệ thống bệnh viện"
      apiPath="/api/admin/dashboard"
      renderData={(data) => (
        <div className="list-grid">
          <div className="panel">
            <h3>Thông tin quản trị</h3>
            <p><strong>Họ tên:</strong> {data?.user?.HoTen || data?.user?.hoten || '---'}</p>
            <p><strong>Email:</strong> {data?.user?.Email || data?.user?.email || '---'}</p>
            <p><strong>Vai trò:</strong> {data?.user?.VaiTro || data?.user?.vaitro || '---'}</p>
          </div>

          <div className="panel">
            <h3>Thống kê</h3>
            <p><strong>Tổng người dùng:</strong> {data?.stats?.totalUsers ?? 0}</p>
            <p><strong>Tổng bác sĩ:</strong> {data?.stats?.totalDoctors ?? 0}</p>
            <p><strong>Tổng bệnh nhân:</strong> {data?.stats?.totalPatients ?? 0}</p>
            <p><strong>Tổng lịch khám:</strong> {data?.stats?.totalAppointments ?? 0}</p>
          </div>
        </div>
      )}
    />
  );
}

function DoctorDashboardPage() {
  return (
    <RoleDashboardPage
      title="Trang bác sĩ"
      subtitle="Xem thông tin và lịch khám của bạn"
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
      title="Trang bệnh nhân"
      subtitle="Theo dõi hồ sơ và lịch khám của bạn"
      apiPath="/api/patient/profile"
      renderData={(data) => (
        <div className="list-grid">
          <div className="panel">
            <h3>Thông tin bệnh nhân</h3>
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

const hospitalLocations = [
  {
    name: 'Bệnh viện Tâm An - Chuyên khoa Trĩ Hậu môn Trực tràng',
    address: '257 Nguyễn Trãi, P. Hạc Thành, tỉnh Thanh Hóa'
  },
  {
    name: 'Phòng khám Đa khoa Tâm An',
    address: '04 Phan Huy Ích, P. Hạc Thành, tỉnh Thanh Hóa'
  },
  {
    name: 'Bệnh viện Đa khoa Tâm An Cơ sở 2',
    address: '05, 06 đường Trịnh Kiểm, P. Quảng Phú, tỉnh Thanh Hóa'
  }
];

const hospitalHotlines = ['0982 499 515', '0919 864 929', '0977 33 55 99'];

function HomePage() {
  const session = readStoredSession();
  const role = normalizeRole(session?.user?.VaiTro || session?.user?.vaitro || '');
  const isLoggedIn = Boolean(session?.token);
  const primaryActionText = isLoggedIn
    ? (role.includes('quantri') ? 'Vào quản trị' : role.includes('bacsi') ? 'Xem lịch khám' : 'Đặt lịch khám')
    : 'Đặt lịch khám ngay';
  const primaryActionPath = isLoggedIn ? getRoleDashboardPath(session?.user) : '/login';

  return (
    <main className="page-shell">
      <section className="hospital-hero">
        <div className="hospital-hero-copy">
          <p className="eyebrow">Bệnh viện Tâm An</p>
          <h1>Chào Mừng Đến Với Bệnh Viện Tâm An</h1>
          <p>
            Hệ thống chăm sóc sức khỏe toàn diện với đội ngũ bác sĩ giàu kinh nghiệm,
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
          <p>Các bác sĩ đầu ngành tận tâm và giàu kinh nghiệm.</p>
        </div>
        <div className="card">
          <div className="icon-circle blue">🩺</div>
          <h3>Dịch Vụ Hiện Đại</h3>
          <p>Trang thiết bị y tế tiên tiến, quy trình chuẩn hóa.</p>
        </div>
        <div className="card">
          <div className="icon-circle gold">📞</div>
          <h3>Hỗ Trợ 24/7</h3>
          <p>Luôn sẵn sàng giải đáp thắc mắc và chăm sóc người bệnh.</p>
        </div>
      </section>
    </main>
  );
}

function HospitalContactPage() {
  return (
    <main className="page-shell">
      <div className="section-header">
        <h2>Liên hệ Hệ thống Y tế Tâm An</h2>
        <p>Địa chỉ và hotline tư vấn chính thức của bệnh viện.</p>
      </div>
      
      <div className="contact-grid">
        {hospitalLocations.map((location) => (
          <div className="contact-item" key={location.name}>
            <div className="contact-icon">📍</div>
            <h3>{location.name}</h3>
            <p>{location.address}</p>
          </div>
        ))}
      </div>
      
      <div className="panel contact-box hotline-contact" style={{ marginTop: '32px' }}>
        <h3>Hotline tư vấn</h3>
        <div className="hotline-list">{hospitalHotlines.map((phone) => <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>)}</div>
      </div>
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

            {message && <p className="form-message" style={{ color: 'red' }}>{message}</p>}

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
              <div className="avatar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="44" height="44">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <span className="badge">{doctor.specialty}</span>
                <p>
                  <strong>Kinh nghiệm:</strong> {doctor.experience}
                </p>
                <p>{doctor.description || 'Chưa có mô tả.'}</p>
              </div>
              <div className="doctor-footer">
                <Link
                  to={isLoggedIn ? getRoleDashboardPath(session?.user) : '/login'}
                  className="btn btn-primary"
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
                <div className="service-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <h3>{service.name}</h3>
              </div>
              <p>{service.description || 'Chưa có thông tin chi tiết.'}</p>
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
            <input type="text" name="HoTen" value={formData.HoTen} onChange={handleChange} placeholder="Nhập họ tên" required />
          </label>
          <label>
            Email
            <input type="email" name="Email" value={formData.Email} onChange={handleChange} placeholder="Nhập email" required />
          </label>
          <label>
            Số điện thoại
            <input type="text" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange} placeholder="Nhập số điện thoại" required />
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
            <input type="password" name="MatKhau" value={formData.MatKhau} onChange={handleChange} placeholder="Nhập mật khẩu" required minLength={6} />
          </label>
          <label>
            Xác nhận mật khẩu
            <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Nhập lại mật khẩu" required />
          </label>
          {message && <p className="form-message" style={{ color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
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
        <Link to="/" className="brand-logo">
          <img src="/logo.jpg" alt="Logo Bệnh viện Tâm An" />
          <span>HỆ THỐNG Y TẾ TÂM AN</span>
        </Link>
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
        <Route path="/contact" element={<HospitalContactPage />} />
        <Route path="/admin" element={<RoleRoute role="admin"><AdminDashboardPage /></RoleRoute>} />
        <Route path="/doctor" element={<RoleRoute role="doctor"><DoctorDashboardPage /></RoleRoute>} />
        <Route path="/patient" element={<RoleRoute role="patient"><PatientDashboardPage /></RoleRoute>} />
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
