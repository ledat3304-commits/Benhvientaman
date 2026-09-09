require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = String(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Requests without an Origin header include local health checks and server-to-server calls.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by FRONTEND_URL'));
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function envBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const sslEnabled = envBoolean(process.env.DB_SSL, Boolean(databaseUrl));

const poolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false
    };

const pool = new Pool({
  ...poolConfig,
  max: Number(process.env.DB_POOL_MAX || 5),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 10000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000)
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

function getUserIdFromRequest(req) {
  const fromQuery = Number(req.query.userId || req.query.userID || req.query.id);
  const fromHeader = Number(req.headers['x-user-id'] || req.headers['x-userid'] || req.headers['x-userID']);
  return Number.isFinite(fromQuery) && fromQuery > 0 ? fromQuery : Number.isFinite(fromHeader) && fromHeader > 0 ? fromHeader : null;
}

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

function isAdminRole(role) {
  const r = normalizeRole(role);
  return ['quanly', 'quantri', 'quantrivien', 'admin', 'administrator'].includes(r);
}

function isDoctorRole(role) {
  return normalizeRole(role) === 'bacsi';
}

function isPatientRole(role) {
  return normalizeRole(role) === 'benhnhan';
}

function normalizeDbRow(row) {
  if (!row) return null;

  const normalized = { ...row };

  if (normalized.userid !== undefined) normalized.UserID = normalized.userid;
  if (normalized.hoten !== undefined) normalized.HoTen = normalized.hoten;
  if (normalized.email !== undefined) normalized.Email = normalized.email;
  if (normalized.sodienthoai !== undefined) normalized.SoDienThoai = normalized.sodienthoai;
  if (normalized.vaitro !== undefined) normalized.VaiTro = normalized.vaitro;
  if (normalized.ngaytao !== undefined) normalized.NgayTao = normalized.ngaytao;
  if (normalized.hoatdong !== undefined) normalized.HoatDong = normalized.hoatdong;
  if (normalized.matkhau !== undefined) normalized.MatKhau = normalized.matkhau;

  if (normalized.bacsiid !== undefined) normalized.BacSiID = normalized.bacsiid;
  if (normalized.benhnhanid !== undefined) normalized.BenhNhanID = normalized.benhnhanid;
  if (normalized.chuyenkhoaid !== undefined) normalized.ChuyenKhoaID = normalized.chuyenkhoaid;
  if (normalized.dichvuid !== undefined) normalized.DichVuID = normalized.dichvuid;
  if (normalized.thuocid !== undefined) normalized.ThuocID = normalized.thuocid;
  if (normalized.lichkhamid !== undefined) normalized.LichKhamID = normalized.lichkhamid;
  if (normalized.thoigiankham !== undefined) normalized.ThoiGianKham = normalized.thoigiankham;
  if (normalized.ngaydatlich !== undefined) normalized.NgayDatLich = normalized.ngaydatlich;
  if (normalized.tenchuyenkhoa !== undefined) normalized.TenChuyenKhoa = normalized.tenchuyenkhoa;
  if (normalized.kinhnghiem !== undefined) normalized.KinhNghiem = normalized.kinhnghiem;
  if (normalized.mota !== undefined) normalized.MoTa = normalized.mota;
  if (normalized.dongia !== undefined) normalized.DonGia = normalized.dongia;
  if (normalized.tendichvu !== undefined) normalized.TenDichVu = normalized.tendichvu;

  return normalized;
}

function sanitizeUser(row) {
  return normalizeDbRow(row);
}

function createToken(userId) {
  return `bta_${userId}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
}

function passwordMatches(inputPassword, storedPassword) {
  if (!storedPassword) return false;

  if (storedPassword.startsWith('$2') || storedPassword.startsWith('$2a') || storedPassword.startsWith('$2y')) {
    try {
      return bcrypt.compareSync(inputPassword, storedPassword);
    } catch (error) {
      return false;
    }
  }

  if (inputPassword === storedPassword) {
    return true;
  }

  const md5Password = crypto.createHash('md5').update(inputPassword).digest('hex');
  return md5Password === storedPassword;
}

async function findUserByIdentifier(identifier) {
  const result = await pool.query(
    'SELECT * FROM nguoidung WHERE email = $1 OR sodienthoai = $1 LIMIT 1',
    [identifier]
  );

  return normalizeDbRow(result.rows[0] || null);
}

async function findUserById(userId) {
  const result = await pool.query(
    'SELECT * FROM nguoidung WHERE userid = $1 LIMIT 1',
    [userId]
  );

  return normalizeDbRow(result.rows[0] || null);
}

async function loadPatientProfile(userId) {
  const patientResult = await pool.query(
    'SELECT * FROM benhnhan WHERE userid = $1 LIMIT 1',
    [userId]
  );

  return normalizeDbRow(patientResult.rows[0] || null);
}

async function loadDoctorProfile(userId) {
  const doctorResult = await pool.query(
    'SELECT * FROM bacsi WHERE userid = $1 LIMIT 1',
    [userId]
  );

  return normalizeDbRow(doctorResult.rows[0] || null);
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: 'Database connection failed or schema is missing.',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/doctors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.bacsiid, u.hoten, c.tenchuyenkhoa, b.kinhnghiem, b.mota
      FROM bacsi b
      LEFT JOIN nguoidung u ON u.userid = b.userid
      LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = b.chuyenkhoaid
      ORDER BY b.bacsiid
    `);

    const doctors = result.rows.map((row) => ({
      id: row.bacsiid,
      name: row.hoten,
      specialty: row.tenchuyenkhoa || 'Chuyên khoa',
      experience: row.kinhnghiem || 'Đang cập nhật',
      description: row.mota || 'Chưa có mô tả.'
    }));

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dichvuid AS id, tendichvu AS name, mota AS description, dongia AS price
      FROM danhmucdichvu
      WHERE hoatdong = true
      ORDER BY dichvuid
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const identifier = String(req.body.username || req.body.identifier || req.body.email || req.body.phone || '').trim();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email/số điện thoại và mật khẩu.' });
    }

    const user = await findUserByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    if (user.HoatDong === false || user.HoatDong === 0) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa.' });
    }

    const storedPassword = user.MatKhau || user.matkhau || '';

    if (!passwordMatches(password, storedPassword)) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    if (storedPassword && !storedPassword.startsWith('$2') && !storedPassword.startsWith('$2a') && !storedPassword.startsWith('$2y')) {
      const newHash = bcrypt.hashSync(password, 10);
      await pool.query(
        'UPDATE nguoidung SET matkhau = $1 WHERE userid = $2',
        [newHash, user.userid || user.UserID]
      );
    }

    return res.json({
      success: true,
      token: createToken(user.UserID),
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập. Vui lòng kiểm tra kết nối Supabase và schema bảng nguoidung.'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const body = req.body || {};
    const HoTen = String(body.HoTen || body.hoTen || body.name || '').trim();
    const Email = String(body.Email || body.email || '').trim();
    const SoDienThoai = String(body.SoDienThoai || body.phone || body.sdt || '').trim();
    const MatKhau = String(body.MatKhau || body.password || '');
    const confirmPassword = String(body.confirm_password || body.confirmPassword || '');
    const NgaySinh = body.NgaySinh || body.ngaySinh || null;
    const GioiTinh = body.GioiTinh || body.gioiTinh || 'Nam';

    if (!HoTen || !Email || !MatKhau) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    }

    if (MatKhau !== confirmPassword && confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp.' });
    }

    const existingUser = await pool.query(
      'SELECT userid FROM nguoidung WHERE email = $1 OR sodienthoai = $2 LIMIT 1',
      [Email, SoDienThoai || null]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email hoặc số điện thoại đã được đăng ký.' });
    }

    const hashedPassword = bcrypt.hashSync(MatKhau, 10);

    const insertedUser = await pool.query(
      `INSERT INTO nguoidung (hoten, email, sodienthoai, matkhau, vaitro, ngaytao, hoatdong)
       VALUES ($1, $2, $3, $4, 'BenhNhan', NOW(), true)
       RETURNING *`,
      [HoTen, Email, SoDienThoai || null, hashedPassword]
    );

    const createdUser = insertedUser.rows[0];

    await pool.query(
      `INSERT INTO benhnhan (userid, hoten, ngaysinh, gioitinh, sodienthoai, diachi)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [createdUser.userid || createdUser.UserID, HoTen, NgaySinh || null, GioiTinh || 'Nam', SoDienThoai || null, null]
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.',
      user: sanitizeUser(createdUser)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký.' });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const patientProfile = await loadPatientProfile(userId);
    const doctorProfile = await loadDoctorProfile(userId);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      patient: patientProfile,
      doctor: doctorProfile
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải hồ sơ.' });
  }
});

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const currentUser = await findUserById(userId);
    if (!currentUser || !isAdminRole(currentUser.VaiTro)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập admin.' });
    }

    const [usersRes, doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM nguoidung'),
      pool.query('SELECT COUNT(*) AS total FROM bacsi'),
      pool.query('SELECT COUNT(*) AS total FROM benhnhan'),
      pool.query('SELECT COUNT(*) AS total FROM lichkham')
    ]);

    return res.json({
      success: true,
      user: sanitizeUser(currentUser),
      stats: {
        totalUsers: Number(usersRes.rows[0]?.total || 0),
        totalDoctors: Number(doctorsRes.rows[0]?.total || 0),
        totalPatients: Number(patientsRes.rows[0]?.total || 0),
        totalAppointments: Number(appointmentsRes.rows[0]?.total || 0)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server admin.' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const currentUser = await findUserById(userId);
    if (!currentUser || !isAdminRole(currentUser.VaiTro)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập admin.' });
    }

    const result = await pool.query(
      'SELECT * FROM nguoidung ORDER BY userid ASC'
    );

    return res.json({ success: true, users: result.rows.map(sanitizeUser) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải người dùng.' });
  }
});

app.get('/api/admin/doctors', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const currentUser = await findUserById(userId);
    if (!currentUser || !isAdminRole(currentUser.VaiTro)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập admin.' });
    }

    const result = await pool.query(`
      SELECT b.bacsiid, u.userid, u.hoten, u.email, u.sodienthoai, c.tenchuyenkhoa, b.kinhnghiem, b.mota
      FROM bacsi b
      LEFT JOIN nguoidung u ON u.userid = b.userid
      LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = b.chuyenkhoaid
      ORDER BY b.bacsiid ASC
    `);

    return res.json({ success: true, doctors: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải danh sách bác sĩ.' });
  }
});

app.get('/api/admin/patients', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const currentUser = await findUserById(userId);
    if (!currentUser || !isAdminRole(currentUser.VaiTro)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập admin.' });
    }

    const result = await pool.query(`
      SELECT bn.benhnhanid, u.userid, u.hoten, u.email, u.sodienthoai, bn.ngaysinh, bn.gioitinh, bn.diachi
      FROM benhnhan bn
      LEFT JOIN nguoidung u ON u.userid = bn.userid
      ORDER BY bn.benhnhanid ASC
    `);

    return res.json({ success: true, patients: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải danh sách bệnh nhân.' });
  }
});

app.get('/api/doctor/dashboard', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const currentUser = await findUserById(userId);
    if (!currentUser || !isDoctorRole(currentUser.VaiTro)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập bác sĩ.' });
    }

    const doctorProfile = await loadDoctorProfile(userId);
    const appointmentsResult = await pool.query(
      `SELECT * FROM lichkham WHERE bacsiid = $1 ORDER BY thoigiankham DESC LIMIT 10`,
      [doctorProfile?.bacsiid || doctorProfile?.BacSiID]
    );

    return res.json({
      success: true,
      user: sanitizeUser(currentUser),
      doctor: doctorProfile,
      appointments: appointmentsResult.rows
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server bác sĩ.' });
  }
});

app.get('/api/patient/profile', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const currentUser = await findUserById(userId);
    if (!currentUser || !isPatientRole(currentUser.VaiTro)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập bệnh nhân.' });
    }

    const patientProfile = await loadPatientProfile(userId);
    const appointmentsResult = await pool.query(
      `SELECT * FROM lichkham WHERE benhnhanid = $1 ORDER BY thoigiankham DESC LIMIT 10`,
      [patientProfile?.benhnhanid || patientProfile?.BenhNhanID]
    );

    return res.json({
      success: true,
      user: sanitizeUser(currentUser),
      patient: patientProfile,
      appointments: appointmentsResult.rows
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server bệnh nhân.' });
  }
});

app.listen(PORT, () => {
  console.log(`Node backend running on port ${PORT}`);
});
