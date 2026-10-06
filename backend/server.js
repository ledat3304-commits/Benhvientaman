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
  if (normalized.yeucauid !== undefined) normalized.YeuCauID = normalized.yeucauid;
  if (normalized.thoigiankham !== undefined) normalized.ThoiGianKham = normalized.thoigiankham;
  if (normalized.ngaymongmuon !== undefined) normalized.NgayMongMuon = normalized.ngaymongmuon;
  if (normalized.giomongmuon !== undefined) normalized.GioMongMuon = normalized.giomongmuon;
  if (normalized.ngaydatlich !== undefined) normalized.NgayDatLich = normalized.ngaydatlich;
  if (normalized.trangthai !== undefined) normalized.TrangThai = normalized.trangthai;
  if (normalized.lydokham !== undefined) normalized.LyDoKham = normalized.lydokham;
  if (normalized.ghichu !== undefined) normalized.GhiChu = normalized.ghichu;
  if (normalized.phibacsitaithoidiem !== undefined) normalized.PhiBacSiTaiThoiDiem = normalized.phibacsitaithoidiem;
  if (normalized.phidichvutaithoidiem !== undefined) normalized.PhiDichVuTaiThoiDiem = normalized.phidichvutaithoidiem;
  if (normalized.tongtamtinh !== undefined) normalized.TongTamTinh = normalized.tongtamtinh;
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

function parseIsoDate(value) {
  const date = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date ? null : parsed;
}

function getWeekdayFromIsoDate(date) {
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function clockToMinutes(value) {
  const match = String(value || '').match(/^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToClock(value) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function isValidPhone(value) {
  const phone = String(value || '').trim();
  if (!/^[0-9+().\s-]+$/.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return (phone.startsWith('+84') && digits.length === 11) || (phone.startsWith('0') && digits.length >= 9 && digits.length <= 11);
}

function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function loadDoctorSchedule(queryable, doctorId, weekday) {
  const result = await queryable.query(
    `SELECT giobatdau, gioketthuc
       FROM lichlamviec
      WHERE bacsiid = $1 AND ngaytrongtuan = $2
      ORDER BY giobatdau`,
    [doctorId, weekday]
  );
  return result.rows;
}

function slotFitsSchedule(scheduleRows, timeMinutes, duration = 30) {
  return scheduleRows.some((row) => {
    const start = clockToMinutes(row.giobatdau);
    const end = clockToMinutes(row.gioketthuc);
    return start !== null && end !== null && timeMinutes >= start && timeMinutes + duration <= end && (timeMinutes - start) % duration === 0;
  });
}

async function loadBookedTimes(queryable, doctorId, date) {
  const result = await queryable.query(
    `SELECT TO_CHAR(thoigiankham, 'HH24:MI') AS time
       FROM lichkham
      WHERE bacsiid = $1
        AND thoigiankham >= $2::date
        AND thoigiankham < ($2::date + INTERVAL '1 day')
        AND COALESCE(trangthai, '') <> 'DaHuy'`,
    [doctorId, date]
  );
  return new Set(result.rows.map((row) => row.time));
}

function optionalId(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
}

function optionalIsoDate(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const date = String(value).trim();
  return parseIsoDate(date) ? date : NaN;
}

function optionalClock(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const clock = String(value).trim().slice(0, 5);
  const minutes = clockToMinutes(clock);
  return minutes === null ? NaN : minutesToClock(minutes);
}

function normalizeRequestCode(requestId, createdAt = new Date()) {
  const date = new Date(createdAt);
  const datePart = Number.isNaN(date.getTime()) ? getTodayIsoDate().replace(/-/g, '') : date.toISOString().slice(0, 10).replace(/-/g, '');
  return `YC${datePart}${String(requestId).padStart(4, '0')}`;
}

function displayRequestValue(value, fallback = 'Chưa cung cấp') {
  return value === undefined || value === null || String(value).trim() === '' ? fallback : String(value);
}

async function notifyAdmins(queryable, title, content) {
  const admins = await queryable.query(
    `SELECT userid
       FROM nguoidung
      WHERE lower(COALESCE(vaitro, '')) IN ('quantri', 'quantrivien', 'quanly', 'admin', 'administrator')
        AND COALESCE(hoatdong, true) = true`
  );
  for (const admin of admins.rows) {
    await queryable.query(
      `INSERT INTO thongbao (userid, loai, tieude, noidung)
       VALUES ($1, 'NEW_BOOKING_REQUEST', $2, $3)`,
      [admin.userid, title, content]
    );
  }
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

app.get('/api/specialties', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT chuyenkhoaid AS id, tenchuyenkhoa AS name, mota AS description
        FROM chuyenkhoa
       ORDER BY tenchuyenkhoa ASC
    `);
    return res.json(result.rows);
  } catch (error) {
    console.error('Public specialties error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải danh sách chuyên khoa.' });
  }
});

app.get('/api/doctors', async (req, res) => {
  try {
    const specialtyId = req.query.specialtyId === undefined || req.query.specialtyId === ''
      ? null
      : Number(req.query.specialtyId);
    if (specialtyId !== null && (!Number.isInteger(specialtyId) || specialtyId < 1)) {
      return res.status(400).json({ success: false, message: 'specialtyId không hợp lệ.' });
    }
    const params = specialtyId === null ? [] : [specialtyId];
    const specialtyFilter = specialtyId === null ? '' : 'WHERE b.chuyenkhoaid = $1';
    const result = await pool.query(`
      SELECT b.bacsiid, b.chuyenkhoaid, u.hoten, c.tenchuyenkhoa, b.kinhnghiem, b.mota,
             b.hocvi, b.chucdanh, b.chuyenmon, b.anhdaidien, b.phidatlich,
             b.thoiluongkham, b.noibat, b.hoatdong
      FROM bacsi b
      LEFT JOIN nguoidung u ON u.userid = b.userid
      LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = b.chuyenkhoaid
      ${specialtyFilter}
      ${specialtyFilter ? 'AND' : 'WHERE'} COALESCE(b.hoatdong, true) = true
      ORDER BY b.bacsiid
    `, params);

    const doctors = result.rows.map((row) => ({
      id: row.bacsiid,
      specialtyId: row.chuyenkhoaid,
      name: row.hoten,
      specialty: row.tenchuyenkhoa || 'Chuyên khoa',
      experience: row.kinhnghiem || 'Đang cập nhật',
      expertise: row.chuyenmon || '',
      description: row.mota || 'Chưa có mô tả.',
      title: row.chucdanh || '',
      education: row.hocvi || '',
      image: row.anhdaidien || '',
      bookingFee: Number(row.phidatlich || 0),
      duration: Number(row.thoiluongkham || 30),
      featured: Boolean(row.noibat)
    }));

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const specialtyId = req.query.specialtyId === undefined || req.query.specialtyId === ''
      ? null
      : Number(req.query.specialtyId);
    if (specialtyId !== null && (!Number.isInteger(specialtyId) || specialtyId < 1)) {
      return res.status(400).json({ success: false, message: 'specialtyId không hợp lệ.' });
    }
    const params = specialtyId === null ? [] : [specialtyId];
    const specialtyFilter = specialtyId === null ? '' : 'AND d.chuyenkhoaid = $1';
    const result = await pool.query(`
      SELECT d.dichvuid AS id,
             d.tendichvu AS name,
             d.mota AS description,
             d.dongia AS price,
             d.chuyenkhoaid AS "specialtyId",
             c.tenchuyenkhoa AS specialty
        FROM danhmucdichvu d
        LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = d.chuyenkhoaid
       WHERE d.hoatdong = true
         ${specialtyFilter}
       ORDER BY d.dichvuid
    `, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/doctors/:doctorId', async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);
    if (!Number.isInteger(doctorId) || doctorId < 1) {
      return res.status(400).json({ success: false, message: 'Mã bác sĩ không hợp lệ.' });
    }
    const result = await pool.query(`
      SELECT b.bacsiid, b.chuyenkhoaid, u.hoten, c.tenchuyenkhoa, b.kinhnghiem, b.mota,
             b.hocvi, b.chucdanh, b.chuyenmon, b.anhdaidien, b.phidatlich,
             b.thoiluongkham, b.noibat, b.hoatdong
        FROM bacsi b
        LEFT JOIN nguoidung u ON u.userid = b.userid
        LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = b.chuyenkhoaid
       WHERE b.bacsiid = $1 AND COALESCE(b.hoatdong, true) = true
       LIMIT 1`,
      [doctorId]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ đang hoạt động.' });
    const schedule = await pool.query(
      `SELECT ngaytrongtuan AS weekday, TO_CHAR(giobatdau, 'HH24:MI') AS start, TO_CHAR(gioketthuc, 'HH24:MI') AS end
         FROM lichlamviec WHERE bacsiid = $1 ORDER BY ngaytrongtuan, giobatdau`,
      [doctorId]
    );
    const row = result.rows[0];
    return res.json({
      success: true,
      doctor: {
        id: row.bacsiid,
        name: row.hoten,
        title: row.chucdanh || '',
        education: row.hocvi || '',
        specialtyId: row.chuyenkhoaid,
        specialty: row.tenchuyenkhoa || 'Chuyên khoa',
        experience: row.kinhnghiem || 'Đang cập nhật',
        expertise: row.chuyenmon || '',
        description: row.mota || 'Chưa có mô tả.',
        image: row.anhdaidien || '',
        bookingFee: Number(row.phidatlich || 0),
        duration: Number(row.thoiluongkham || 30),
        featured: Boolean(row.noibat),
        workingHours: schedule.rows
      }
    });
  } catch (error) {
    console.error('Doctor detail error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải hồ sơ bác sĩ.' });
  }
});

app.get('/api/doctors/:doctorId/available-slots', async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);
    const date = String(req.query.date || '').trim();
    if (!Number.isInteger(doctorId) || doctorId < 1) {
      return res.status(400).json({ success: false, message: 'Mã bác sĩ không hợp lệ.' });
    }
    if (!parseIsoDate(date)) {
      return res.status(400).json({ success: false, message: 'Ngày khám phải đúng định dạng YYYY-MM-DD.' });
    }
    if (date < getTodayIsoDate()) {
      return res.status(400).json({ success: false, message: 'Không thể chọn ngày khám trong quá khứ.' });
    }

    const doctorResult = await pool.query('SELECT bacsiid, hoatdong, thoiluongkham FROM bacsi WHERE bacsiid = $1', [doctorId]);
    if (!doctorResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ.' });
    }
    if (doctorResult.rows[0].hoatdong === false) {
      return res.status(404).json({ success: false, message: 'Bác sĩ hiện không nhận lịch khám.' });
    }
    const duration = Number(doctorResult.rows[0].thoiluongkham || 30);
    if (!Number.isInteger(duration) || duration < 15 || duration > 240) {
      return res.status(500).json({ success: false, message: 'Thời lượng khám của bác sĩ chưa hợp lệ.' });
    }

    const schedules = await loadDoctorSchedule(pool, doctorId, getWeekdayFromIsoDate(date));
    const bookedTimes = await loadBookedTimes(pool, doctorId, date);
    const slotTimes = new Set();
    schedules.forEach((row) => {
      const start = clockToMinutes(row.giobatdau);
      const end = clockToMinutes(row.gioketthuc);
      if (start === null || end === null || end <= start) return;
      for (let cursor = start; cursor + duration <= end; cursor += duration) slotTimes.add(minutesToClock(cursor));
    });

    return res.json({
      success: true,
      doctorId,
      date,
      duration,
      slots: Array.from(slotTimes).sort().map((time) => ({ time, available: !bookedTimes.has(time) }))
    });
  } catch (error) {
    console.error('Available slots error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải khung giờ khám.' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const client = await pool.connect();
  try {
    const body = req.body || {};
    const doctorId = Number(body.doctorId || body.BacSiID || body.bacsiid);
    const serviceId = Number(body.serviceId || body.DichVuID || body.dichvuid || 0);
    const specialtyId = optionalId(body.specialtyId ?? body.ChuyenKhoaID ?? body.chuyenkhoaid);
    const date = String(body.date || body.apptDate || '').trim();
    const time = String(body.time || body.apptTime || '').trim();
    const name = String(body.name || body.HoTen || body.hoten || '').trim();
    const phone = String(body.phone || body.SoDienThoai || body.sodienthoai || '').trim();
    const email = String(body.email || body.Email || '').trim() || null;
    const reason = String(body.reason || body.Symptoms || body.LyDoKham || '').trim() || null;

    const parsedDate = parseIsoDate(date);
    const timeMinutes = clockToMinutes(time);

    if (phone && !/^\d+$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại chỉ được chứa chữ số.' });
    }
    if (!Number.isInteger(doctorId) || doctorId < 1 || Number.isNaN(specialtyId) || !parsedDate || date < getTodayIsoDate() || timeMinutes === null || !name || name.length > 100 || !isValidPhone(phone) || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ bác sĩ, ngày giờ, họ tên và số điện thoại.' });
    }

    const appointmentTime = `${date} ${time}:00`;
    const requester = await getAuthenticatedUser(req);
    const requesterId = requester ? Number(requester.UserID || requester.userid) : null;

    await client.query('BEGIN');
    const doctorResult = await client.query('SELECT bacsiid, chuyenkhoaid, hoatdong, thoiluongkham, phidatlich FROM bacsi WHERE bacsiid = $1', [doctorId]);
    if (!doctorResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ.' });
    }

    if (doctorResult.rows[0].hoatdong === false) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Bác sĩ hiện không nhận lịch khám.' });
    }
    if (specialtyId && Number(doctorResult.rows[0].chuyenkhoaid) !== specialtyId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Bác sĩ đã chọn không thuộc chuyên khoa hiện tại.' });
    }
    const duration = Number(doctorResult.rows[0].thoiluongkham || 30);
    if (!Number.isInteger(duration) || duration < 15 || duration > 240) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Giờ khám không đúng thời lượng hoặc khung giờ hợp lệ.' });
    }
    const schedules = await loadDoctorSchedule(client, doctorId, getWeekdayFromIsoDate(date));
    if (!schedules.length || !slotFitsSchedule(schedules, timeMinutes, duration)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Bác sĩ không làm việc trong khung giờ đã chọn.' });
    }

    let selectedService = null;
    if (serviceId > 0) {
      const serviceResult = await client.query(
        `SELECT dichvuid, chuyenkhoaid, dongia
           FROM danhmucdichvu
          WHERE dichvuid = $1 AND hoatdong = true`,
        [serviceId]
      );
      selectedService = serviceResult.rows[0];
      if (!selectedService) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ đang hoạt động.' });
      }
      if (specialtyId && Number(selectedService.chuyenkhoaid) !== specialtyId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Dịch vụ đã chọn không thuộc chuyên khoa hiện tại.' });
      }
      if (Number(selectedService.chuyenkhoaid || 0) > 0 && Number(doctorResult.rows[0].chuyenkhoaid || 0) !== Number(selectedService.chuyenkhoaid)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Dịch vụ và bác sĩ không cùng chuyên khoa.' });
      }
    }

    const duplicate = await client.query(
      `SELECT lichkhamid FROM lichkham
       WHERE bacsiid = $1 AND thoigiankham = $2 AND COALESCE(trangthai, '') <> 'DaHuy'
       LIMIT 1`,
      [doctorId, appointmentTime]
    );
    if (duplicate.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Khung giờ này đã có lịch. Vui lòng chọn giờ khác.' });
    }

    let patientResult;
    if (requesterId) {
      patientResult = await client.query('SELECT * FROM benhnhan WHERE userid = $1 LIMIT 1 FOR UPDATE', [requesterId]);
    } else {
      patientResult = { rows: [] };
    }

    let patientId;
    if (patientResult.rows[0]) {
      patientId = patientResult.rows[0].benhnhanid;
      await client.query(
        `UPDATE benhnhan
            SET hoten = COALESCE(NULLIF($1, ''), hoten),
                sodienthoai = COALESCE(NULLIF($2, ''), sodienthoai),
                email = COALESCE($3, email)
          WHERE benhnhanid = $4`,
        [name, phone, email, patientId]
      );
    } else {
      const newPatient = requesterId
        ? await client.query(
            `INSERT INTO benhnhan (userid, hoten, sodienthoai, email)
             VALUES ($1, $2, $3, $4) RETURNING benhnhanid`,
            [requesterId, name, phone, email]
          )
        : await client.query(
            `INSERT INTO benhnhan (userid, hoten, sodienthoai, email)
             VALUES (NULL, $1, $2, $3) RETURNING benhnhanid`,
            [name, phone, email]
          );
      patientId = newPatient.rows[0].benhnhanid;
    }

    const appointmentResult = await client.query(
      `INSERT INTO lichkham (bacsiid, benhnhanid, thoigiankham, trangthai, lydokham, ngaydatlich, trieuchung, phibacsitaithoidiem)
       VALUES ($1, $2, $3, 'ChoXacNhan', $4, NOW(), $5, $6)
       RETURNING *`,
      [doctorId, patientId, appointmentTime, reason, reason, doctorResult.rows[0].phidatlich || 0]
    );

    if (selectedService) {
      await client.query(
        `INSERT INTO chitietdichvukham (lichkhamid, dichvuid, soluong, dongiataithoidiem)
         VALUES ($1, $2, 1, $3)`,
        [appointmentResult.rows[0].lichkhamid, selectedService.dichvuid, selectedService.dongia]
      );
      await client.query(
        `UPDATE thongbao
            SET noidung = noidung || format(' Dịch vụ đã chọn: %s.', dv.tendichvu)
           FROM danhmucdichvu dv
          WHERE thongbao.lichkhamid = $1
            AND thongbao.loai = 'NEW_APPOINTMENT'
            AND dv.dichvuid = $2`,
        [appointmentResult.rows[0].lichkhamid, selectedService.dichvuid]
      );
    }

    await client.query('COMMIT');
    const appointment = normalizeDbRow(appointmentResult.rows[0]);
    return res.status(201).json({
      success: true,
      message: 'Đặt lịch thành công. Thông tin đã được báo về tài khoản admin.',
      bookingCode: `TA${new Date().getFullYear()}${String(appointment.LichKhamID).padStart(6, '0')}`,
      appointment
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Create appointment error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Khung giờ này đã có lịch. Vui lòng chọn giờ khác.' });
    }
    if (error.code === '42703') {
      return res.status(500).json({ success: false, message: 'Schema chưa cập nhật các cột booking mới. Hãy chạy migration booking.' });
    }
    return res.status(500).json({ success: false, message: 'Không thể lưu lịch khám.' });
  } finally {
    client.release();
  }
});

app.post('/api/booking-requests', async (req, res) => {
  const client = await pool.connect();
  try {
    const body = req.body || {};
    const name = String(body.name || body.HoTen || body.hoten || '').trim();
    const phone = String(body.phone || body.SoDienThoai || body.sodienthoai || '').trim();
    const email = String(body.email || body.Email || '').trim() || null;
    const specialtyId = optionalId(body.specialtyId ?? body.ChuyenKhoaID ?? body.chuyenkhoaid);
    const serviceId = optionalId(body.serviceId ?? body.DichVuID ?? body.dichvuid);
    const doctorId = optionalId(body.doctorId ?? body.BacSiID ?? body.bacsiid);
    const preferredDate = optionalIsoDate(body.preferredDate ?? body.date ?? body.NgayMongMuon);
    const preferredTime = optionalClock(body.preferredTime ?? body.time ?? body.GioMongMuon);
    const reason = String(body.reason || body.Symptoms || body.LyDoKham || '').trim() || null;
    const note = String(body.note || body.notes || body.GhiChu || '').trim() || null;

    if (phone && !/^\d+$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại chỉ được chứa chữ số.' });
    }
    if (!name || name.length > 100 || !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên và số điện thoại hợp lệ.' });
    }
    if (!isValidEmail(email) || Number.isNaN(specialtyId) || Number.isNaN(serviceId) || Number.isNaN(doctorId) || Number.isNaN(preferredDate) || Number.isNaN(preferredTime)) {
      return res.status(400).json({ success: false, message: 'Thông tin phiếu yêu cầu chưa hợp lệ.' });
    }
    if (preferredDate && preferredDate < getTodayIsoDate()) {
      return res.status(400).json({ success: false, message: 'Ngày mong muốn không được nằm trong quá khứ.' });
    }

    const requester = await getAuthenticatedUser(req);
    const requesterId = requester ? Number(requester.UserID || requester.userid) : null;
    await client.query('BEGIN');

    let specialtyName = null;
    if (specialtyId) {
      const result = await client.query('SELECT chuyenkhoaid, tenchuyenkhoa FROM chuyenkhoa WHERE chuyenkhoaid = $1', [specialtyId]);
      if (!result.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Không tìm thấy chuyên khoa.' });
      }
      specialtyName = result.rows[0].tenchuyenkhoa;
    }

    let serviceName = null;
    let serviceSpecialtyId = null;
    let serviceFee = null;
    if (serviceId) {
      const result = await client.query('SELECT dichvuid, chuyenkhoaid, tendichvu, dongia FROM danhmucdichvu WHERE dichvuid = $1 AND hoatdong = true', [serviceId]);
      if (!result.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ đang hoạt động.' });
      }
      serviceSpecialtyId = result.rows[0].chuyenkhoaid;
      if (specialtyId && Number(serviceSpecialtyId) !== specialtyId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Dịch vụ đã chọn không thuộc chuyên khoa hiện tại.' });
      }
      serviceName = result.rows[0].tendichvu;
      serviceFee = Number(result.rows[0].dongia || 0);
    }

    let doctorName = null;
    let doctorFee = null;
    if (doctorId) {
      const result = await client.query(
        `SELECT b.bacsiid, b.chuyenkhoaid, b.hoatdong, b.phidatlich, u.hoten
           FROM bacsi b JOIN nguoidung u ON u.userid = b.userid
          WHERE b.bacsiid = $1`,
        [doctorId]
      );
      if (!result.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ.' });
      }
      if (result.rows[0].hoatdong === false) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Bác sĩ hiện không nhận lịch khám.' });
      }
      if (specialtyId && Number(result.rows[0].chuyenkhoaid) !== specialtyId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Bác sĩ không thuộc chuyên khoa đã chọn.' });
      }
      if (serviceSpecialtyId && Number(result.rows[0].chuyenkhoaid) !== Number(serviceSpecialtyId)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Dịch vụ và bác sĩ không cùng chuyên khoa.' });
      }
      doctorName = result.rows[0].hoten;
      doctorFee = Number(result.rows[0].phidatlich || 0);
    }

    const estimatedTotal = (doctorFee || 0) + (serviceFee || 0);

    const inserted = await client.query(
      `INSERT INTO yeucaudatlich
        (userid, hoten, sodienthoai, email, chuyenkhoaid, dichvuid, bacsiid, ngaymongmuon, giomongmuon, lydokham, ghichu,
         phibacsitaithoidiem, phidichvutaithoidiem, tongtamtinh)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [requesterId, name, phone, email, specialtyId, serviceId, doctorId, preferredDate, preferredTime, reason, note, doctorFee, serviceFee, estimatedTotal]
    );
    const requestRow = normalizeDbRow(inserted.rows[0]);
    const requestCode = normalizeRequestCode(requestRow.YeuCauID, requestRow.ngaytao);
    const notificationContent = [
      `Doctor fee: ${displayRequestValue(doctorFee, 'Not provided')}`,
      `Service fee: ${displayRequestValue(serviceFee, 'Not provided')}`,
      `Estimated total: ${displayRequestValue(estimatedTotal, '0')}`,
      `Mã yêu cầu: ${requestCode}`,
      `Khách hàng: ${displayRequestValue(name)}`,
      `SĐT: ${displayRequestValue(phone)}`,
      `Email: ${displayRequestValue(email)}`,
      `Chuyên khoa: ${displayRequestValue(specialtyName, 'Chưa chọn')}`,
      `Dịch vụ: ${displayRequestValue(serviceName, 'Chưa chọn')}`,
      `Bác sĩ: ${displayRequestValue(doctorName, 'Cần bệnh viện tư vấn')}`,
      `Ngày mong muốn: ${displayRequestValue(preferredDate, 'Chưa chọn')}`,
      `Giờ mong muốn: ${displayRequestValue(preferredTime, 'Chưa chọn')}`,
      `Lý do khám: ${displayRequestValue(reason)}`,
      `Ghi chú: ${displayRequestValue(note, 'Chưa cung cấp')}`
    ].join(' | ');
    await notifyAdmins(client, 'Yêu cầu đặt lịch mới', notificationContent);

    await client.query('COMMIT');
    return res.status(201).json({
      success: true,
      requestCode,
      message: 'Bệnh viện đã nhận được yêu cầu đặt lịch và sẽ liên hệ xác nhận.',
      request: requestRow
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Create booking request error:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ success: false, message: 'Bảng yêu cầu đặt lịch chưa được cài đặt migration.' });
    }
    return res.status(500).json({ success: false, message: 'Không thể lưu yêu cầu đặt lịch.' });
  } finally {
    client.release();
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
      `INSERT INTO benhnhan (userid, hoten, ngaysinh, gioitinh, sodienthoai, email, diachi)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [createdUser.userid || createdUser.UserID, HoTen, NgaySinh || null, GioiTinh || 'Nam', SoDienThoai || null, Email, null]
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
    const authenticatedUser = await getAuthenticatedUser(req);
    const userId = authenticatedUser ? Number(authenticatedUser.UserID || authenticatedUser.userid) : null;

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
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const userId = Number(admin.UserID || admin.userid);
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

    let unreadNotifications = 0;
    try {
      const notificationsCount = await pool.query(
        'SELECT COUNT(*) AS total FROM thongbao WHERE userid = $1 AND dadoc = false',
        [userId]
      );
      unreadNotifications = Number(notificationsCount.rows[0]?.total || 0);
    } catch (notificationError) {
      if (notificationError.code !== '42P01') throw notificationError;
      console.warn('Notification table is not installed yet.');
    }

    return res.json({
      success: true,
      user: sanitizeUser(currentUser),
      stats: {
        totalUsers: Number(usersRes.rows[0]?.total || 0),
        totalDoctors: Number(doctorsRes.rows[0]?.total || 0),
        totalPatients: Number(patientsRes.rows[0]?.total || 0),
        totalAppointments: Number(appointmentsRes.rows[0]?.total || 0),
        unreadNotifications
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server admin.' });
  }
});

app.get('/api/admin/notifications', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;

    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);
    const unreadOnly = String(req.query.unreadOnly || '').toLowerCase() === 'true';
    const result = await pool.query(
      `SELECT thongbaoid, userid, lichkhamid, loai, tieude, noidung, dadoc, ngaydoc, ngaytao
         FROM thongbao
        WHERE userid = $1
          AND ($2 = false OR dadoc = false)
        ORDER BY ngaytao DESC
        LIMIT $3`,
      [admin.UserID || admin.userid, unreadOnly, limit]
    );

    return res.json({ success: true, notifications: result.rows });
  } catch (error) {
    console.error('Admin notifications error:', error);
    return res.status(error.code === '42P01' ? 503 : 500).json({
      success: false,
      message: error.code === '42P01'
        ? 'Bảng thông báo chưa được cài đặt. Hãy chạy migration admin notifications.'
        : 'Không thể tải thông báo admin.'
    });
  }
});

app.patch('/api/admin/notifications/:notificationId/read', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const notificationId = Number(req.params.notificationId);
    if (!Number.isInteger(notificationId) || notificationId < 1) {
      return res.status(400).json({ success: false, message: 'Mã thông báo không hợp lệ.' });
    }

    const result = await pool.query(
      `UPDATE thongbao
          SET dadoc = true, ngaydoc = CURRENT_TIMESTAMP
        WHERE thongbaoid = $1 AND userid = $2
        RETURNING *`,
      [notificationId, admin.UserID || admin.userid]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
    return res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(error.code === '42P01' ? 503 : 500).json({ success: false, message: 'Không thể cập nhật thông báo.' });
  }
});

app.patch('/api/admin/notifications/read-all', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const result = await pool.query(
      `UPDATE thongbao
          SET dadoc = true, ngaydoc = CURRENT_TIMESTAMP
        WHERE userid = $1 AND dadoc = false`,
      [admin.UserID || admin.userid]
    );
    return res.json({ success: true, updated: result.rowCount });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(error.code === '42P01' ? 503 : 500).json({ success: false, message: 'Không thể cập nhật thông báo.' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const userId = Number(admin.UserID || admin.userid);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const currentUser = await findUserById(userId);
    if (!currentUser || !isAdminRole(currentUser.VaiTro)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập admin.' });
    }

    const result = await pool.query(
      `SELECT userid, hoten, email, sodienthoai, vaitro, hoatdong, ngaytao
         FROM nguoidung
        ORDER BY userid ASC`
    );

    return res.json({ success: true, users: result.rows.map(sanitizeUser) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải người dùng.' });
  }
});

app.get('/api/admin/doctors', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const userId = Number(admin.UserID || admin.userid);
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
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const userId = Number(admin.UserID || admin.userid);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const currentUser = await findUserById(userId);
    if (!currentUser || !isAdminRole(currentUser.VaiTro)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập admin.' });
    }

    const result = await pool.query(`
      SELECT bn.benhnhanid, bn.userid,
             COALESCE(NULLIF(bn.hoten, ''), u.hoten) AS hoten,
             COALESCE(NULLIF(bn.email, ''), u.email) AS email,
             COALESCE(NULLIF(bn.sodienthoai, ''), u.sodienthoai) AS sodienthoai,
             bn.ngaysinh, bn.gioitinh, bn.diachi
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
             l.trieuchung, l.ngaydatlich, l.phibacsitaithoidiem, d.bacsiid, du.hoten AS tenbacsi,
             c.tenchuyenkhoa,
             bn.benhnhanid, bn.userid AS patientuserid,
             COALESCE(NULLIF(bn.hoten, ''), pu.hoten) AS tenbenhnhan,
             COALESCE(NULLIF(bn.email, ''), pu.email) AS emailbenhnhan,
             COALESCE(NULLIF(bn.sodienthoai, ''), pu.sodienthoai) AS sodienthoaibenhnhan,
             bn.ngaysinh, bn.gioitinh, bn.diachi,
             dv.dichvuid, dv.tendichvu, ctd.dongiataithoidiem
      FROM lichkham l
      JOIN bacsi d ON d.bacsiid = l.bacsiid
      JOIN nguoidung du ON du.userid = d.userid
      JOIN benhnhan bn ON bn.benhnhanid = l.benhnhanid
      LEFT JOIN nguoidung pu ON pu.userid = bn.userid
      LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = d.chuyenkhoaid
      LEFT JOIN chitietdichvukham ctd ON ctd.lichkhamid = l.lichkhamid
      LEFT JOIN danhmucdichvu dv ON dv.dichvuid = ctd.dichvuid
      ORDER BY l.thoigiankham DESC
      LIMIT 200
    `);

    return res.json({ success: true, appointments: result.rows });
  } catch (error) {
    console.error('Admin appointments error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải danh sách lịch khám.' });
  }
});

app.get('/api/admin/booking-requests', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const result = await pool.query(`
      SELECT r.*, c.tenchuyenkhoa, dv.tendichvu, du.hoten AS tenbacsi
        FROM yeucaudatlich r
        LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = r.chuyenkhoaid
        LEFT JOIN danhmucdichvu dv ON dv.dichvuid = r.dichvuid
        LEFT JOIN bacsi b ON b.bacsiid = r.bacsiid
        LEFT JOIN nguoidung du ON du.userid = b.userid
       ORDER BY r.ngaytao DESC
       LIMIT 200
    `);
    return res.json({
      success: true,
      requests: result.rows.map((row) => ({ ...normalizeDbRow(row), requestCode: normalizeRequestCode(row.yeucauid, row.ngaytao) }))
    });
  } catch (error) {
    console.error('Admin booking requests error:', error);
    return res.status(error.code === '42P01' ? 503 : 500).json({ success: false, message: 'Không thể tải yêu cầu đặt lịch.' });
  }
});

app.get('/api/admin/booking-requests/:requestId', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const requestId = Number(req.params.requestId);
    if (!Number.isInteger(requestId) || requestId < 1) {
      return res.status(400).json({ success: false, message: 'Request id is invalid.' });
    }
    const result = await pool.query(`
      SELECT r.*, c.tenchuyenkhoa, dv.tendichvu, du.hoten AS tenbacsi
        FROM yeucaudatlich r
        LEFT JOIN chuyenkhoa c ON c.chuyenkhoaid = r.chuyenkhoaid
        LEFT JOIN danhmucdichvu dv ON dv.dichvuid = r.dichvuid
        LEFT JOIN bacsi b ON b.bacsiid = r.bacsiid
        LEFT JOIN nguoidung du ON du.userid = b.userid
       WHERE r.yeucauid = $1
       LIMIT 1
    `, [requestId]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Booking request not found.' });
    const row = result.rows[0];
    return res.json({ success: true, request: { ...normalizeDbRow(row), requestCode: normalizeRequestCode(row.yeucauid, row.ngaytao) } });
  } catch (error) {
    console.error('Admin booking request detail error:', error);
    return res.status(error.code === '42P01' ? 503 : 500).json({ success: false, message: 'Could not load booking request.' });
  }
});

app.patch('/api/admin/booking-requests/:requestId/status', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const requestId = Number(req.params.requestId);
    const status = String(req.body?.status || '').trim();
    const validStatuses = ['ChoLienHe', 'DangXuLy', 'DaXacNhan', 'DaChuyenThanhLichKham', 'DaHuy'];
    if (!Number.isInteger(requestId) || requestId < 1 || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Yêu cầu hoặc trạng thái không hợp lệ.' });
    }
    const result = await pool.query(
      'UPDATE yeucaudatlich SET trangthai = $1 WHERE yeucauid = $2 RETURNING *',
      [status, requestId]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu đặt lịch.' });
    return res.json({ success: true, request: { ...normalizeDbRow(result.rows[0]), requestCode: normalizeRequestCode(requestId, result.rows[0].ngaytao) } });
  } catch (error) {
    console.error('Admin booking request status error:', error);
    return res.status(error.code === '42P01' ? 503 : 500).json({ success: false, message: 'Không thể cập nhật yêu cầu đặt lịch.' });
  }
});

// Keep the shorter PATCH contract as an alias for existing admin clients.
app.patch('/api/admin/booking-requests/:requestId', async (req, res) => {
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const requestId = Number(req.params.requestId);
    const status = String(req.body?.status || req.body?.trangthai || '').trim();
    const validStatuses = ['ChoLienHe', 'DangXuLy', 'DaXacNhan', 'DaChuyenThanhLichKham', 'DaHuy'];
    if (!Number.isInteger(requestId) || requestId < 1 || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Request or status is invalid.' });
    }
    const result = await pool.query(
      'UPDATE yeucaudatlich SET trangthai = $1 WHERE yeucauid = $2 RETURNING *',
      [status, requestId]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Booking request not found.' });
    return res.json({ success: true, request: { ...normalizeDbRow(result.rows[0]), requestCode: normalizeRequestCode(requestId, result.rows[0].ngaytao) } });
  } catch (error) {
    console.error('Admin booking request patch error:', error);
    return res.status(error.code === '42P01' ? 503 : 500).json({ success: false, message: 'Could not update booking request.' });
  }
});

app.post('/api/admin/booking-requests/:requestId/convert', async (req, res) => {
  const client = await pool.connect();
  try {
    const admin = await requireRole(req, res, 'admin');
    if (!admin) return;
    const requestId = Number(req.params.requestId);
    if (!Number.isInteger(requestId) || requestId < 1) {
      return res.status(400).json({ success: false, message: 'Mã yêu cầu không hợp lệ.' });
    }

    await client.query('BEGIN');
    const requestResult = await client.query('SELECT * FROM yeucaudatlich WHERE yeucauid = $1 FOR UPDATE', [requestId]);
    const request = requestResult.rows[0];
    if (!request) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu đặt lịch.' });
    }
    if (request.trangthai === 'DaChuyenThanhLichKham' && request.lichkhamid) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Yêu cầu này đã được chuyển thành lịch khám.' });
    }
    if (request.trangthai === 'DaHuy') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Không thể chuyển yêu cầu đã hủy.' });
    }

    const doctorId = optionalId(req.body?.doctorId ?? request.bacsiid);
    const serviceId = optionalId(req.body?.serviceId ?? request.dichvuid);
    const specialtyId = optionalId(req.body?.specialtyId ?? request.chuyenkhoaid);
    const date = optionalIsoDate(req.body?.preferredDate ?? request.ngaymongmuon);
    const time = optionalClock(req.body?.preferredTime ?? request.giomongmuon);
    if (!doctorId || !date || !time || Number.isNaN(doctorId) || Number.isNaN(date) || Number.isNaN(time) || date < getTodayIsoDate()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cần chọn đủ bác sĩ, ngày và giờ hợp lệ trước khi xác nhận.' });
    }
    if (Number.isNaN(serviceId) || Number.isNaN(specialtyId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Chuyên khoa hoặc dịch vụ không hợp lệ.' });
    }
    const timeMinutes = clockToMinutes(time);
    if (timeMinutes === null) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Giờ khám không hợp lệ.' });
    }

    const doctorResult = await client.query('SELECT bacsiid, chuyenkhoaid, hoatdong, thoiluongkham, phidatlich FROM bacsi WHERE bacsiid = $1', [doctorId]);
    if (!doctorResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ.' });
    }
    if (doctorResult.rows[0].hoatdong === false) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Bác sĩ hiện không nhận lịch khám.' });
    }
    if (specialtyId && Number(doctorResult.rows[0].chuyenkhoaid) !== specialtyId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Bác sĩ không thuộc chuyên khoa đã chọn.' });
    }
    const duration = Number(doctorResult.rows[0].thoiluongkham || 30);
    if (!Number.isInteger(duration) || duration < 15 || duration > 240) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Thời lượng khám của bác sĩ chưa hợp lệ.' });
    }
    const schedules = await loadDoctorSchedule(client, doctorId, getWeekdayFromIsoDate(date));
    if (!schedules.length || !slotFitsSchedule(schedules, timeMinutes, duration)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Bác sĩ không làm việc trong khung giờ đã chọn.' });
    }

    const duplicate = await client.query(
      `SELECT lichkhamid FROM lichkham
        WHERE bacsiid = $1 AND thoigiankham = $2 AND COALESCE(trangthai, '') <> 'DaHuy'
        LIMIT 1`,
      [doctorId, `${date} ${time}:00`]
    );
    if (duplicate.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Khung giờ này đã có lịch. Vui lòng chọn giờ khác.' });
    }

    const doctorFee = Number(doctorResult.rows[0].phidatlich || 0);
    let serviceSpecialtyId = null;
    let serviceFee = null;
    if (serviceId) {
      const serviceResult = await client.query('SELECT dichvuid, chuyenkhoaid, dongia FROM danhmucdichvu WHERE dichvuid = $1 AND hoatdong = true', [serviceId]);
      if (!serviceResult.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ đang hoạt động.' });
      }
      serviceSpecialtyId = serviceResult.rows[0].chuyenkhoaid;
      if (specialtyId && Number(serviceSpecialtyId) !== specialtyId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Dịch vụ đã chọn không thuộc chuyên khoa hiện tại.' });
      }
      if (serviceSpecialtyId && Number(serviceSpecialtyId) !== Number(doctorResult.rows[0].chuyenkhoaid)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Dịch vụ và bác sĩ không cùng chuyên khoa.' });
      }
      serviceFee = Number(serviceResult.rows[0].dongia || 0);
    }

    let patientResult = { rows: [] };
    if (request.userid) {
      patientResult = await client.query('SELECT * FROM benhnhan WHERE userid = $1 LIMIT 1 FOR UPDATE', [request.userid]);
    }
    let patientId;
    if (patientResult.rows[0]) {
      patientId = patientResult.rows[0].benhnhanid;
      await client.query(
        `UPDATE benhnhan SET hoten = $1, sodienthoai = $2, email = COALESCE($3, email) WHERE benhnhanid = $4`,
        [request.hoten, request.sodienthoai, request.email, patientId]
      );
    } else {
      const insertedPatient = await client.query(
        `INSERT INTO benhnhan (userid, hoten, sodienthoai, email)
         VALUES ($1, $2, $3, $4) RETURNING benhnhanid`,
        [request.userid || null, request.hoten, request.sodienthoai, request.email]
      );
      patientId = insertedPatient.rows[0].benhnhanid;
    }

    const appointmentResult = await client.query(
      `INSERT INTO lichkham (bacsiid, benhnhanid, thoigiankham, trangthai, lydokham, ngaydatlich, trieuchung, phibacsitaithoidiem)
       VALUES ($1, $2, $3, 'ChoXacNhan', $4, NOW(), $5, $6)
       RETURNING *`,
      [doctorId, patientId, `${date} ${time}:00`, request.lydokham, request.lydokham, doctorResult.rows[0].phidatlich || 0]
    );
    if (serviceId) {
      const serviceResult = await client.query('SELECT dongia FROM danhmucdichvu WHERE dichvuid = $1', [serviceId]);
      await client.query(
        `INSERT INTO chitietdichvukham (lichkhamid, dichvuid, soluong, dongiataithoidiem) VALUES ($1, $2, 1, $3)`,
        [appointmentResult.rows[0].lichkhamid, serviceId, serviceResult.rows[0].dongia]
      );
    }
    const updatedRequest = await client.query(
      `UPDATE yeucaudatlich
          SET chuyenkhoaid = $1, dichvuid = $2, bacsiid = $3, ngaymongmuon = $4,
              giomongmuon = $5, phibacsitaithoidiem = $6, phidichvutaithoidiem = $7,
              tongtamtinh = $8, trangthai = 'DaChuyenThanhLichKham', lichkhamid = $9
        WHERE yeucauid = $10
        RETURNING *`,
      [specialtyId || doctorResult.rows[0].chuyenkhoaid || null, serviceId, doctorId, date, time, doctorFee, serviceFee, doctorFee + (serviceFee || 0), appointmentResult.rows[0].lichkhamid, requestId]
    );

    await client.query('COMMIT');
    const appointment = normalizeDbRow(appointmentResult.rows[0]);
    return res.status(201).json({
      success: true,
      message: 'Đã chuyển yêu cầu thành lịch khám.',
      bookingCode: `TA${new Date().getFullYear()}${String(appointment.LichKhamID).padStart(6, '0')}`,
      appointment,
      request: { ...normalizeDbRow(updatedRequest.rows[0]), requestCode: normalizeRequestCode(requestId, updatedRequest.rows[0].ngaytao) }
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Convert booking request error:', error);
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Khung giờ này đã có lịch. Vui lòng chọn giờ khác.' });
    if (error.code === '42P01') return res.status(503).json({ success: false, message: 'Bảng yêu cầu đặt lịch chưa được cài đặt migration.' });
    return res.status(500).json({ success: false, message: 'Không thể chuyển yêu cầu thành lịch khám.' });
  } finally {
    client.release();
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
    const bookingFee = Number(req.body?.bookingFee || req.body?.phidatlich || 0);
    const duration = Number(req.body?.duration || req.body?.thoiluongkham || 30);
    if (!name || !email || password.length < 6 || !Number.isFinite(bookingFee) || bookingFee < 0 || !Number.isInteger(duration) || duration < 15 || duration > 240) {
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
      `INSERT INTO bacsi (userid, chuyenkhoaid, mota, kinhnghiem, hocvi, chucdanh, chuyenmon, anhdaidien, phidatlich, thoiluongkham, noibat, hoatdong)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)`,
      [userId, Number.isInteger(specialtyId) ? specialtyId : null, req.body?.description || null, req.body?.experience || null, req.body?.education || null, req.body?.title || null, req.body?.expertise || null, req.body?.image || null, bookingFee, duration, Boolean(req.body?.featured)]
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
    const bookingFee = req.body?.bookingFee === undefined ? null : Number(req.body.bookingFee);
    const duration = req.body?.duration === undefined ? null : Number(req.body.duration);
    if ((bookingFee !== null && (!Number.isFinite(bookingFee) || bookingFee < 0)) || (duration !== null && (!Number.isInteger(duration) || duration < 15 || duration > 240))) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Giá hoặc thời lượng khám không hợp lệ.' });
    }
    await client.query(
      `UPDATE nguoidung SET hoten = COALESCE($1, hoten), email = COALESCE($2, email),
       sodienthoai = COALESCE($3, sodienthoai) WHERE userid = $4`,
      [req.body?.name || null, req.body?.email || null, req.body?.phone || null, userId]
    );
    await client.query(
      `UPDATE bacsi SET chuyenkhoaid = COALESCE($1, chuyenkhoaid), mota = COALESCE($2, mota),
       kinhnghiem = COALESCE($3, kinhnghiem), hocvi = COALESCE($4, hocvi), chucdanh = COALESCE($5, chucdanh),
       chuyenmon = COALESCE($6, chuyenmon), anhdaidien = COALESCE($7, anhdaidien),
       phidatlich = COALESCE($8, phidatlich), thoiluongkham = COALESCE($9, thoiluongkham),
       noibat = COALESCE($10, noibat), hoatdong = COALESCE($11, hoatdong)
       WHERE bacsiid = $12`,
      [req.body?.specialtyId ? Number(req.body.specialtyId) : null, req.body?.description || null, req.body?.experience || null, req.body?.education || null, req.body?.title || null, req.body?.expertise || null, req.body?.image || null, bookingFee, duration, req.body?.featured === undefined ? null : Boolean(req.body.featured), req.body?.active === undefined ? null : Boolean(req.body.active), doctorId]
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
    const validStatuses = ['ChoXacNhan', 'DaXacNhan', 'DangKham', 'DaHoanThanh', 'HoanThanh', 'DaHuy', 'VangMat'];
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
    const authenticatedUser = await getAuthenticatedUser(req);
    const userId = authenticatedUser ? Number(authenticatedUser.UserID || authenticatedUser.userid) : null;
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
    const authenticatedUser = await getAuthenticatedUser(req);
    const userId = authenticatedUser ? Number(authenticatedUser.UserID || authenticatedUser.userid) : null;
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
