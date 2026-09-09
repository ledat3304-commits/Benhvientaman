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
            <p><strong>Tổng người dùng:</strong> {data?.stats?.totalUsers ?? 5}</p>
            <p><strong>Tổng bác sĩ:</strong> {data?.stats?.totalDoctors ?? 2}</p>
            <p><strong>Tổng bệnh nhân:</strong> {data?.stats?.totalPatients ?? 5}</p>
            <p><strong>Tổng lịch khám:</strong> {data?.stats?.totalAppointments ?? 6}</p>
          </div>
        </div>
      )}
    />
  );
}

function AdminControlPanel() {
  const session = readStoredSession();
  const [section, setSection] = useState('overview');
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', phone: '', password: '', specialtyId: '', experience: '', description: '' });

  const adminFetch = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...getSessionHeaders(session), ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Thao tác không thành công.');
    return payload;
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overview, userData, doctorData, patientData, appointmentData, specialtyData, serviceData, medicineData] = await Promise.all([
        adminFetch('/api/admin/dashboard'),
        adminFetch('/api/admin/users'),
        adminFetch('/api/admin/doctors'),
        adminFetch('/api/admin/patients'),
        adminFetch('/api/admin/appointments'),
        adminFetch('/api/admin/specialties'),
        adminFetch('/api/admin/services'),
        adminFetch('/api/admin/medicines')
      ]);
      setDashboard(overview);
      setUsers(userData.users || []);
      setDoctors(doctorData.doctors || []);
      setPatients(patientData.patients || []);
      setAppointments(appointmentData.appointments || []);
      setSpecialties(specialtyData.specialties || []);
      setServices(serviceData.services || []);
      setMedicines(medicineData.medicines || []);
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.token) loadAdminData();
  }, [session?.token]);

  const updateRole = async (user: any, role: string) => {
    try {
      await adminFetch(`/api/admin/users/${user.userid || user.UserID}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
      await loadAdminData();
      setMessage('Đã cập nhật role tài khoản.');
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const toggleUser = async (user: any) => {
    try {
      await adminFetch(`/api/admin/users/${user.userid || user.UserID}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !(user.hoatdong ?? user.HoatDong) })
      });
      await loadAdminData();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const createDoctor = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await adminFetch('/api/admin/doctors', { method: 'POST', body: JSON.stringify(doctorForm) });
      setDoctorForm({ name: '', email: '', phone: '', password: '', specialtyId: '', experience: '', description: '' });
      await loadAdminData();
      setMessage('Đã tạo tài khoản bác sĩ.');
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const createCatalogItem = async (path: string, body: Record<string, unknown>) => {
    try {
      await adminFetch(path, { method: 'POST', body: JSON.stringify(body) });
      await loadAdminData();
      setMessage('Đã thêm dữ liệu mới.');
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  if (!session?.token) return <Navigate to="/login" replace />;

  return (
    <main className="page-shell admin-shell">
      <div className="section-header">
        <h2>Trung tâm quản trị hệ thống</h2>
        <p>Admin có toàn quyền quản lý tài khoản, bác sĩ, bệnh nhân, lịch khám và danh mục bệnh viện.</p>
      </div>

      {message && <div className="admin-alert">{message}</div>}
      {loading && !dashboard ? <p>Đang tải dữ liệu quản trị...</p> : (
        <>
          <div className="admin-stat-grid">
            <div className="admin-stat"><span>Người dùng</span><strong>{dashboard?.stats?.totalUsers ?? 0}</strong></div>
            <div className="admin-stat"><span>Bác sĩ</span><strong>{dashboard?.stats?.totalDoctors ?? 0}</strong></div>
            <div className="admin-stat"><span>Bệnh nhân</span><strong>{dashboard?.stats?.totalPatients ?? 0}</strong></div>
            <div className="admin-stat"><span>Lịch khám</span><strong>{dashboard?.stats?.totalAppointments ?? 0}</strong></div>
          </div>

          <div className="admin-tabs">
            {[
              ['overview', 'Tổng quan'], ['users', 'Tài khoản'], ['doctors', 'Bác sĩ'],
              ['patients', 'Bệnh nhân'], ['appointments', 'Lịch khám'], ['catalog', 'Danh mục']
            ].map(([key, label]) => (
              <button key={key} type="button" className={section === key ? 'active' : ''} onClick={() => setSection(key)}>{label}</button>
            ))}
          </div>

          {section === 'overview' && <div className="list-grid">
            <div className="panel"><h3>Vai trò hệ thống</h3><p><strong>QuanTri:</strong> quản lý toàn bộ hệ thống.</p><p><strong>BacSi:</strong> xem và xử lý lịch khám được phân công.</p><p><strong>BenhNhan:</strong> quản lý hồ sơ và lịch khám cá nhân.</p></div>
            <div className="panel"><h3>Tài khoản quản trị</h3><p>{dashboard?.user?.hoten || dashboard?.user?.HoTen}</p><p>{dashboard?.user?.email || dashboard?.user?.Email}</p><span className="badge">QuanTri</span></div>
          </div>}

          {section === 'users' && <div className="panel admin-panel-wide"><h3>Quản lý tài khoản và role</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Họ tên</th><th>Email</th><th>Role</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{users.map((user) => <tr key={user.userid || user.UserID}><td>{user.hoten || user.HoTen}</td><td>{user.email || user.Email}</td><td><select value={getUserRole(user)} onChange={(event) => updateRole(user, event.target.value)}><option value="admin">Admin</option><option value="doctor">Bác sĩ</option><option value="patient">Bệnh nhân</option></select></td><td>{(user.hoatdong ?? user.HoatDong) ? 'Đang hoạt động' : 'Đã khóa'}</td><td><button type="button" className="btn btn-small" onClick={() => toggleUser(user)}>{(user.hoatdong ?? user.HoatDong) ? 'Khóa' : 'Mở khóa'}</button></td></tr>)}</tbody></table></div></div>}

          {section === 'doctors' && <div className="admin-two-column"><div className="panel"><h3>Tạo tài khoản bác sĩ</h3><form onSubmit={createDoctor}><input placeholder="Họ tên" value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} required /><input type="email" placeholder="Email" value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} required /><input placeholder="Số điện thoại" value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })} /><input type="password" placeholder="Mật khẩu" value={doctorForm.password} onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })} minLength={6} required /><select value={doctorForm.specialtyId} onChange={(e) => setDoctorForm({ ...doctorForm, specialtyId: e.target.value })}><option value="">Chọn chuyên khoa</option>{specialties.map((item) => <option key={item.chuyenkhoaid} value={item.chuyenkhoaid}>{item.tenchuyenkhoa}</option>)}</select><input placeholder="Kinh nghiệm" value={doctorForm.experience} onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })} /><textarea placeholder="Mô tả" value={doctorForm.description} onChange={(e) => setDoctorForm({ ...doctorForm, description: e.target.value })} /><button className="btn btn-primary" type="submit">Tạo bác sĩ</button></form></div><div className="panel admin-panel-wide"><h3>Danh sách bác sĩ</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Họ tên</th><th>Email</th><th>Chuyên khoa</th><th>Kinh nghiệm</th></tr></thead><tbody>{doctors.map((doctor) => <tr key={doctor.bacsiid}><td>{doctor.hoten}</td><td>{doctor.email}</td><td>{doctor.tenchuyenkhoa || 'Chưa cập nhật'}</td><td>{doctor.kinhnghiem || 'Chưa cập nhật'}</td></tr>)}</tbody></table></div></div></div>}

          {section === 'patients' && <div className="panel admin-panel-wide"><h3>Danh sách bệnh nhân</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Ngày sinh</th><th>Địa chỉ</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.benhnhanid}><td>{patient.hoten || '---'}</td><td>{patient.email || '---'}</td><td>{patient.sodienthoai || '---'}</td><td>{patient.ngaysinh || '---'}</td><td>{patient.diachi || '---'}</td></tr>)}</tbody></table></div></div>}

          {section === 'appointments' && <div className="panel admin-panel-wide"><h3>Quản lý lịch khám</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Thời gian</th><th>Bác sĩ</th><th>Bệnh nhân</th><th>Lý do</th><th>Trạng thái</th></tr></thead><tbody>{appointments.map((item) => <tr key={item.lichkhamid}><td>{item.thoigiankham}</td><td>{item.tenbacsi}</td><td>{item.tenbenhnhan || '---'}</td><td>{item.lydokham || '---'}</td><td><select value={item.trangthai} onChange={async (e) => { await adminFetch(`/api/admin/appointments/${item.lichkhamid}/status`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) }); await loadAdminData(); }}><option value="ChoXacNhan">Chờ xác nhận</option><option value="DaXacNhan">Đã xác nhận</option><option value="DangKham">Đang khám</option><option value="HoanThanh">Hoàn thành</option><option value="DaHuy">Đã hủy</option><option value="VangMat">Vắng mặt</option></select></td></tr>)}</tbody></table></div></div>}

          {section === 'catalog' && <div className="admin-two-column"><div className="panel"><h3>Thêm chuyên khoa</h3><form onSubmit={(e) => { e.preventDefault(); const form = new FormData(e.currentTarget); createCatalogItem('/api/admin/specialties', { name: form.get('name'), description: form.get('description') }); e.currentTarget.reset(); }}><input name="name" placeholder="Tên chuyên khoa" required /><textarea name="description" placeholder="Mô tả" /><button className="btn btn-primary">Thêm chuyên khoa</button></form><h3>Chuyên khoa hiện có</h3>{specialties.map((item) => <p key={item.chuyenkhoaid}>{item.tenchuyenkhoa}</p>)}</div><div className="panel"><h3>Thêm dịch vụ</h3><form onSubmit={(e) => { e.preventDefault(); const form = new FormData(e.currentTarget); createCatalogItem('/api/admin/services', { name: form.get('name'), description: form.get('description'), price: Number(form.get('price') || 0) }); e.currentTarget.reset(); }}><input name="name" placeholder="Tên dịch vụ" required /><input name="price" type="number" min="0" placeholder="Đơn giá" /><textarea name="description" placeholder="Mô tả" /><button className="btn btn-primary">Thêm dịch vụ</button></form><h3>Thêm thuốc</h3><form onSubmit={(e) => { e.preventDefault(); const form = new FormData(e.currentTarget); createCatalogItem('/api/admin/medicines', { name: form.get('name'), activeIngredient: form.get('activeIngredient'), unit: form.get('unit') }); e.currentTarget.reset(); }}><input name="name" placeholder="Tên thuốc" required /><input name="activeIngredient" placeholder="Hoạt chất" /><input name="unit" placeholder="Đơn vị tính" required /><button className="btn btn-primary">Thêm thuốc</button></form><p>Đang có {services.length} dịch vụ và {medicines.length} thuốc.</p></div></div>}
        </>
      )}
    </main>
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
        <Route path="/admin" element={<RoleRoute role="admin"><AdminControlPanel /></RoleRoute>} />
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
