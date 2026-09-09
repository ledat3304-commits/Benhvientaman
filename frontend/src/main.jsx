import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function HomePage() {
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
            <Link to="/login" className="btn btn-primary">Đặt lịch khám ngay</Link>
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
  return (
    <main className="page-shell centered">
      <div className="panel login-panel">
        <div className="login-header">
          <div className="login-icon">🛡️</div>
          <h2>Đăng Nhập Hệ Thống</h2>
          <p>Cổng thông tin Bệnh viện Tâm An</p>
        </div>

        <div className="login-body">
          <form>
            <label>
              Email hoặc Số điện thoại
              <input type="text" placeholder="nhap@email.com hoặc 090..." />
            </label>

            <label>
              Mật khẩu
              <input type="password" placeholder="••••••••" />
            </label>

            <div className="row-between">
              <label className="checkbox-label">
                <input type="checkbox" />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/contact" className="text-link small">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="btn btn-primary full-width">Đăng Nhập</button>

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
                <Link to="/login" className="btn btn-secondary">
                  Đặt lịch khám
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
                <Link to="/login" className="btn btn-secondary small-btn">
                  Đăng ký ngay
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
  return (
    <main className="page-shell centered">
      <div className="panel">
        <h2>Đăng ký tài khoản</h2>
        <form>
          <label>
            Họ và tên
            <input type="text" placeholder="Nhập họ tên" />
          </label>
          <label>
            Email
            <input type="email" placeholder="Nhập email" />
          </label>
          <label>
            Mật khẩu
            <input type="password" placeholder="Nhập mật khẩu" />
          </label>
          <button type="submit" className="btn btn-primary full-width">Đăng ký</button>
        </form>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="brand">Bệnh viện Tâm An</div>
        <nav>
          <Link to="/">Trang chủ</Link>
          <Link to="/doctors">Bác sĩ</Link>
          <Link to="/services">Dịch vụ</Link>
          <Link to="/contact">Liên hệ</Link>
          <Link to="/login">Đăng nhập</Link>
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
