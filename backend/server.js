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

function getAccessToken(req) {
  const authorization = String(req.headers.authorization || '');
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return String(req.headers['x-auth-token'] || '').trim() || null;
}

function normalizeRole(role) {
  return String(role || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[\u0111\u0110]/g, 'd')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function getRoleKey(role) {
  const normalized = normalizeRole(role);

  if (['quanly', 'quantri', 'quantrivien', 'admin', 'administrator'].includes(normalized)) {
    return 'admin';
  }

  if (['bacsi', 'doctor'].includes(normalized)) {
    return 'doctor';
  }

  if (['benhnhan', 'patient'].includes(normalized)) {
    return 'patient';
  }

  return '';
}

function isAdminRole(role) {
  return getRoleKey(role) === 'admin';
}

function isDoctorRole(role) {
  return getRoleKey(role) === 'doctor';
}

function isPatientRole(role) {
  return getRoleKey(role) === 'patient';
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
  const normalized = normalizeDbRow(row);
  if (!normalized) return null;

  const { MatKhau, matkhau, ...safeUser } = normalized;
  return safeUser;
}

async function createToken(userId) {
  const selector = crypto.randomBytes(16).toString('hex');
  const validator = crypto.randomBytes(32).toString('hex');
  const validatorHash = crypto.createHash('sha256').update(validator).digest('hex');

  await pool.query(
    `INSERT INTO auth_tokens (userid, selector, validatorhash, expiresat)
     VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
    [userId, selector, validatorHash]
  );

  return `${selector}.${validator}`;
}

async function getAuthenticatedUser(req) {
  const accessToken = getAccessToken(req);

  if (accessToken) {
    const [selector, validator] = accessToken.split('.');
    if (!selector || !validator) return null;

    const validatorHash = crypto.createHash('sha256').update(validator).digest('hex');
    const result = await pool.query(
      `SELECT u.*
       FROM auth_tokens t
       JOIN nguoidung u ON u.userid = t.userid
       WHERE t.selector = $1
         AND t.validatorhash = $2
         AND t.expiresat > NOW()
         AND COALESCE(u.hoatdong, true) = true
       LIMIT 1`,
      [selector, validatorHash]
    );

    return normalizeDbRow(result.rows[0] || null);
  }

  // Keep local development compatible with the old client. Production must use Bearer tokens.
  if (String(process.env.NODE_ENV || '').toLowerCase() !== 'production') {
    const legacyUserId = getUserIdFromRequest(req);
    return legacyUserId ? findUserById(legacyUserId) : null;
  }

  return null;
}

async function requireRole(req, res, role) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    return null;
  }

  if (role && getRoleKey(user.VaiTro) !== role) {
    res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này.' });
    return null;
  }

  return user;
}

// Verify Bearer sessions before legacy handlers read x-user-id. This keeps the
// existing API contract working while preventing user-id spoofing in production.
app.use(async (req, res, next) => {
  if (!getAccessToken(req)) return next();

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    }

    req.headers['x-user-id'] = String(user.UserID || user.userid);
    req.authenticatedUser = user;
    return next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ success: false, message: 'Không thể xác thực phiên đăng nhập.' });
  }
});

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
    `SELECT b.*, c.tenchuyenkhoa
     FROM bacsi b
     LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = b.chuyenkhoaid
     WHERE b.userid = $1
     LIMIT 1`,
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

    const role = getRoleKey(user.VaiTro);
    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'Tai khoan chua duoc gan vai tro hop le.'
      });
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
      token: await createToken(user.UserID),
      role,
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

// Admin management APIs. These use the existing database tables and never delete
// users as part of normal administration; accounts are disabled instead.
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;

    const result = await pool.query(`
      SELECT l.lichkhamid, l.thoigiankham, l.trangthai, l.lydokham,
             l.ngaydatlich, d.bacsiid, du.hoten AS tenbacsi,
             bn.benhnhanid, pu.hoten AS tenbenhnhan
      FROM lichkham l
      JOIN bacsi d ON d.bacsiid = l.bacsiid
      JOIN nguoidung du ON du.userid = d.userid
      JOIN benhnhan bn ON bn.benhnhanid = l.benhnhanid
      LEFT JOIN nguoidung pu ON pu.userid = bn.userid
      ORDER BY l.thoigiankham DESC
      LIMIT 200
    `);

    return res.json({ success: true, appointments: result.rows });
  } catch (error) {
    console.error('Admin appointments error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải danh sách lịch khám.' });
  }
});

app.get('/api/admin/specialties', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const result = await pool.query('SELECT * FROM chuyenkhoa ORDER BY tenchuyenkhoa ASC');
    return res.json({ success: true, specialties: result.rows });
  } catch (error) {
    console.error('Admin specialties error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải chuyên khoa.' });
  }
});

app.get('/api/admin/services', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const result = await pool.query('SELECT * FROM danhmucdichvu ORDER BY dichvuid DESC');
    return res.json({ success: true, services: result.rows });
  } catch (error) {
    console.error('Admin services error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải dịch vụ.' });
  }
});

app.get('/api/admin/medicines', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const result = await pool.query('SELECT * FROM danhmucthuoc ORDER BY tenthuoc ASC');
    return res.json({ success: true, medicines: result.rows });
  } catch (error) {
    console.error('Admin medicines error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải danh mục thuốc.' });
  }
});

app.patch('/api/admin/users/:userId/status', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;

    const userId = Number(req.params.userId);
    const active = req.body?.active === true || String(req.body?.active).toLowerCase() === 'true';
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ success: false, message: 'UserID không hợp lệ.' });
    }
    if (userId === Number(admin.UserID || admin.userid) && !active) {
      return res.status(400).json({ success: false, message: 'Không thể tự khóa tài khoản admin hiện tại.' });
    }

    const result = await pool.query(
      'UPDATE nguoidung SET hoatdong = $1 WHERE userid = $2 RETURNING *',
      [active, userId]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    return res.json({ success: true, user: sanitizeUser(result.rows[0]) });
  } catch (error) {
    console.error('Admin user status error:', error);
    return res.status(500).json({ success: false, message: 'Không thể cập nhật trạng thái tài khoản.' });
  }
});

app.patch('/api/admin/users/:userId/role', async (req, res) => {
  const client = await pool.connect();
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;

    const userId = Number(req.params.userId);
    const requestedRole = getRoleKey(req.body?.role || req.body?.vaitro);
    const dbRole = { admin: 'QuanTri', doctor: 'BacSi', patient: 'BenhNhan' }[requestedRole];
    if (!Number.isInteger(userId) || !dbRole) {
      return res.status(400).json({ success: false, message: 'UserID hoặc role không hợp lệ.' });
    }

    await client.query('BEGIN');
    const userResult = await client.query('SELECT * FROM nguoidung WHERE userid = $1 FOR UPDATE', [userId]);
    const user = userResult.rows[0];
    if (!user) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    if (requestedRole === 'doctor') {
      const specialtyId = req.body?.specialtyId ? Number(req.body.specialtyId) : null;
      await client.query(
        `INSERT INTO bacsi (userid, chuyenkhoaid, mota, kinhnghiem)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (userid) DO UPDATE SET
           chuyenkhoaid = COALESCE(EXCLUDED.chuyenkhoaid, bacsi.chuyenkhoaid),
           mota = COALESCE(EXCLUDED.mota, bacsi.mota),
           kinhnghiem = COALESCE(EXCLUDED.kinhnghiem, bacsi.kinhnghiem)`,
        [userId, Number.isInteger(specialtyId) ? specialtyId : null, req.body?.description || null, req.body?.experience || null]
      );
    }

    if (requestedRole === 'patient') {
      const phone = String(req.body?.phone || user.sodienthoai || '').trim();
      if (!phone) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Bệnh nhân cần có số điện thoại.' });
      }
      await client.query(
        `INSERT INTO benhnhan (userid, hoten, sodienthoai)
         VALUES ($1, $2, $3)
         ON CONFLICT (userid) DO UPDATE SET hoten = EXCLUDED.hoten, sodienthoai = EXCLUDED.sodienthoai`,
        [userId, user.hoten, phone]
      );
    }

    const updated = await client.query(
      'UPDATE nguoidung SET vaitro = $1 WHERE userid = $2 RETURNING *',
      [dbRole, userId]
    );
    await client.query('COMMIT');
    return res.json({ success: true, user: sanitizeUser(updated.rows[0]), role: requestedRole });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Admin role update error:', error);
    return res.status(500).json({ success: false, message: 'Không thể cập nhật role.' });
  } finally {
    client.release();
  }
});

app.post('/api/admin/doctors', async (req, res) => {
  const client = await pool.connect();
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;

    const name = String(req.body?.name || req.body?.hoten || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const phone = String(req.body?.phone || '').trim() || null;
    const password = String(req.body?.password || '').trim();
    const specialtyId = req.body?.specialtyId ? Number(req.body.specialtyId) : null;
    if (!name || !email || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Cần họ tên, email và mật khẩu tối thiểu 6 ký tự.' });
    }

    await client.query('BEGIN');
    const duplicate = await client.query('SELECT userid FROM nguoidung WHERE lower(email) = lower($1)', [email]);
    if (duplicate.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Email đã tồn tại.' });
    }

    const userResult = await client.query(
      `INSERT INTO nguoidung (hoten, email, sodienthoai, matkhau, vaitro, hoatdong)
       VALUES ($1, $2, $3, $4, 'BacSi', true) RETURNING *`,
      [name, email, phone, bcrypt.hashSync(password, 10)]
    );
    const userId = userResult.rows[0].userid;
    await client.query(
      `INSERT INTO bacsi (userid, chuyenkhoaid, mota, kinhnghiem)
       VALUES ($1, $2, $3, $4)`,
      [userId, Number.isInteger(specialtyId) ? specialtyId : null, req.body?.description || null, req.body?.experience || null]
    );
    await client.query('COMMIT');
    return res.status(201).json({ success: true, user: sanitizeUser(userResult.rows[0]) });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Admin create doctor error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tạo tài khoản bác sĩ.' });
  } finally {
    client.release();
  }
});

app.patch('/api/admin/doctors/:doctorId', async (req, res) => {
  const client = await pool.connect();
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const doctorId = Number(req.params.doctorId);
    if (!Number.isInteger(doctorId) || doctorId < 1) {
      return res.status(400).json({ success: false, message: 'BacSiID không hợp lệ.' });
    }

    await client.query('BEGIN');
    const doctorResult = await client.query('SELECT userid FROM bacsi WHERE bacsiid = $1 FOR UPDATE', [doctorId]);
    if (!doctorResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ.' });
    }
    const userId = doctorResult.rows[0].userid;
    await client.query(
      `UPDATE nguoidung SET hoten = COALESCE($1, hoten), email = COALESCE($2, email),
       sodienthoai = COALESCE($3, sodienthoai) WHERE userid = $4`,
      [req.body?.name || null, req.body?.email || null, req.body?.phone || null, userId]
    );
    await client.query(
      `UPDATE bacsi SET chuyenkhoaid = COALESCE($1, chuyenkhoaid), mota = COALESCE($2, mota),
       kinhnghiem = COALESCE($3, kinhnghiem) WHERE bacsiid = $4`,
      [req.body?.specialtyId ? Number(req.body.specialtyId) : null, req.body?.description || null, req.body?.experience || null, doctorId]
    );
    await client.query('COMMIT');
    return res.json({ success: true, message: 'Đã cập nhật bác sĩ.' });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Admin update doctor error:', error);
    return res.status(500).json({ success: false, message: 'Không thể cập nhật bác sĩ.' });
  } finally {
    client.release();
  }
});

app.patch('/api/admin/appointments/:appointmentId/status', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const appointmentId = Number(req.params.appointmentId);
    const status = String(req.body?.status || '').trim();
    const validStatuses = ['ChoXacNhan', 'DaXacNhan', 'DangKham', 'HoanThanh', 'DaHuy', 'VangMat'];
    if (!Number.isInteger(appointmentId) || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Lịch khám hoặc trạng thái không hợp lệ.' });
    }
    const result = await pool.query(
      'UPDATE lichkham SET trangthai = $1 WHERE lichkhamid = $2 RETURNING *',
      [status, appointmentId]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khám.' });
    return res.json({ success: true, appointment: result.rows[0] });
  } catch (error) {
    console.error('Admin appointment status error:', error);
    return res.status(500).json({ success: false, message: 'Không thể cập nhật lịch khám.' });
  }
});

app.post('/api/admin/specialties', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'Tên chuyên khoa là bắt buộc.' });
    const result = await pool.query('INSERT INTO chuyenkhoa (tenchuyenkhoa, mota) VALUES ($1, $2) RETURNING *', [name, req.body?.description || null]);
    return res.status(201).json({ success: true, specialty: result.rows[0] });
  } catch (error) {
    console.error('Admin create specialty error:', error);
    return res.status(error.code === '23505' ? 409 : 500).json({ success: false, message: 'Không thể tạo chuyên khoa.' });
  }
});

app.post('/api/admin/services', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const name = String(req.body?.name || '').trim();
    const price = Number(req.body?.price || 0);
    if (!name || !Number.isFinite(price) || price < 0) return res.status(400).json({ success: false, message: 'Tên và giá dịch vụ không hợp lệ.' });
    const result = await pool.query(
      'INSERT INTO danhmucdichvu (tendichvu, mota, dongia, hoatdong) VALUES ($1, $2, $3, true) RETURNING *',
      [name, req.body?.description || null, price]
    );
    return res.status(201).json({ success: true, service: result.rows[0] });
  } catch (error) {
    console.error('Admin create service error:', error);
    return res.status(error.code === '23505' ? 409 : 500).json({ success: false, message: 'Không thể tạo dịch vụ.' });
  }
});

app.post('/api/admin/medicines', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const name = String(req.body?.name || '').trim();
    const unit = String(req.body?.unit || '').trim();
    if (!name || !unit) return res.status(400).json({ success: false, message: 'Tên thuốc và đơn vị tính là bắt buộc.' });
    const result = await pool.query(
      'INSERT INTO danhmucthuoc (tenthuoc, hoatchat, donvitinh) VALUES ($1, $2, $3) RETURNING *',
      [name, req.body?.activeIngredient || null, unit]
    );
    return res.status(201).json({ success: true, medicine: result.rows[0] });
  } catch (error) {
    console.error('Admin create medicine error:', error);
    return res.status(error.code === '23505' ? 409 : 500).json({ success: false, message: 'Không thể tạo thuốc.' });
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
