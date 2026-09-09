import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './styles.css';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '')
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

function saveSession(session: { token: string; user: any }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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

function HomePage() {
  const session = readStoredSession();
  const role = String(session?.user?.VaiTro || session?.user?.vaitro || '').trim().toLowerCase();
  const isLoggedIn = Boolean(session?.token);
  const primaryActionText = isLoggedIn
    ? (role.includes('quantri') ? 'Vào quản trị' : role.includes('bacsi') ? 'Xem lịch khám' : 'Đặt lịch khám ngay')
    : 'Đặt lịch khám ngay';

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
            <Link to={isLoggedIn ? '/services' : '/login'} className="btn btn-primary">{primaryActionText}</Link>
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
      window.location.href = '/';
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
  const role = String(session?.user?.VaiTro || session?.user?.vaitro || '').trim().toLowerCase();
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
                  to={isLoggedIn ? '/services' : '/login'}
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
  const role = String(session?.user?.VaiTro || session?.user?.vaitro || '').trim().toLowerCase();
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
                  to={isLoggedIn ? '/contact' : '/login'}
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
  const isLoggedIn = Boolean(session?.token);
  const userName = session?.user?.HoTen || session?.user?.hoten || 'Tài khoản';

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="brand">Bệnh viện Tâm An</div>
        <nav>
          <Link to="/">Trang chủ</Link>
          <Link to="/doctors">Bác sĩ</Link>
          <Link to="/services">Dịch vụ</Link>
          <Link to="/contact">Liên hệ</Link>

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
