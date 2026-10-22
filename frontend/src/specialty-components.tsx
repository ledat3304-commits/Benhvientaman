import { FormEvent, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : 'https://benhvientaman.onrender.com')
).replace(/\/+$/, '');

type IconName = 'scope' | 'endoscopy' | 'surgery' | 'care' | 'lock' | 'arrow';

function MedicalIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    scope: <><circle cx="12" cy="12" r="7.5" /><path d="M12 4.5V2m0 20v-2.5M4.5 12H2m20 0h-2.5" /><circle cx="12" cy="12" r="2" /></>,
    endoscopy: <><path d="M6 4h6a4 4 0 0 1 4 4v2a4 4 0 0 0 4 4h1" /><path d="M6 4v7a5 5 0 0 0 5 5h2" /><path d="M18 14v4a3 3 0 0 1-3 3h-3" /><circle cx="6" cy="4" r="2" /><circle cx="21" cy="14" r="1.5" /></>,
    surgery: <><path d="M7 4v6m-3-3h6M16 4v4m-2-2h4" /><path d="M8 14h8a3 3 0 0 1 3 3v2H5v-2a3 3 0 0 1 3-3Z" /><path d="M12 14v5" /><path d="M9 19v2m6-2v2" /></>,
    care: <><path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" /><path d="M12 9v6m-3-3h6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></>,
    arrow: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
  };

  return <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const menuGroups = [
  {
    label: 'Bệnh Trĩ',
    links: [
      ['Trĩ nội', '/benh-ly/benh-tri#tri-noi'],
      ['Trĩ ngoại', '/benh-ly/benh-tri#tri-ngoai'],
      ['Trĩ hỗn hợp', '/benh-ly/benh-tri#tri-hon-hop'],
    ],
  },
  {
    label: 'Bệnh Hậu Môn',
    links: [
      ['Rò hậu môn', '/benh-ly/ro-hau-mon'],
      ['Nứt kẽ hậu môn', '/benh-ly/nut-ke-hau-mon'],
      ['Áp-xe hậu môn', '/benh-ly/ap-xe-hau-mon'],
    ],
  },
  {
    label: 'Bệnh Trực Tràng',
    links: [
      ['Viêm trực tràng', '/benh-ly/viem-truc-trang'],
      ['Polyp trực tràng', '/benh-ly/polyp-truc-trang'],
    ],
  },
  {
    label: 'Phương pháp điều trị',
    links: [
      ['Longo', '/phuong-phap-dieu-tri-tri#longo'],
      ['PPH', '/phuong-phap-dieu-tri-tri#pph'],
      ['HCPT', '/phuong-phap-dieu-tri-tri#hcpt'],
    ],
  },
] as const;

export function SpecialtyHeader() {
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const location = useLocation();

  const closeMenu = () => {
    setOpen(false);
    setActiveMenu(null);
  };

  return (
    <header className="specialty-header">
      <div className="specialty-header-inner">
        <Link to="/" className="specialty-brand" onClick={closeMenu}>
          <img src="/logo.jpg" alt="Bệnh viện Tâm An" />
          <span><strong>TÂM AN</strong><small>Chuyên khoa Hậu môn - Trực tràng</small></span>
        </Link>

        <button type="button" className="specialty-menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Mở menu" aria-expanded={open}>
          <span /><span /><span />
        </button>

        <nav className={open ? 'specialty-nav is-open' : 'specialty-nav'} aria-label="Điều hướng chuyên khoa">
          <Link className={location.pathname === '/' ? 'is-active' : ''} to="/" onClick={closeMenu}>Trang chủ</Link>
          {menuGroups.map((group) => (
            <div className={`specialty-nav-group${activeMenu === group.label ? ' is-open' : ''}`} key={group.label}>
              <button type="button" onClick={() => setActiveMenu((value) => value === group.label ? null : group.label)} aria-expanded={activeMenu === group.label}>
                {group.label}<span aria-hidden="true">⌄</span>
              </button>
              <div className="specialty-dropdown">
                {group.links.map(([label, href]) => <Link to={href} key={href} onClick={closeMenu}>{label}</Link>)}
              </div>
            </div>
          ))}
          <Link className={location.pathname === '/dat-lich' ? 'is-active specialty-nav-cta' : 'specialty-nav-cta'} to="/dat-lich" onClick={closeMenu}>Đặt lịch bảo mật</Link>
        </nav>
      </div>
    </header>
  );
}

const services = [
  { icon: 'scope' as IconName, title: 'Khám và tầm soát bệnh lý Hậu môn - Trực tràng.', text: 'Đánh giá triệu chứng, thăm khám kín đáo và tư vấn hướng xử trí phù hợp.' },
  { icon: 'endoscopy' as IconName, title: 'Nội soi tiêu hóa (Dạ dày - Đại tràng) gây mê.', text: 'Tầm soát tổn thương tiêu hóa với quy trình an toàn, nhẹ nhàng và riêng tư.' },
  { icon: 'surgery' as IconName, title: 'Phẫu thuật cắt trĩ công nghệ cao (PPH, HCPT, Laser).', text: 'Lựa chọn kỹ thuật theo mức độ bệnh, ưu tiên giảm đau và rút ngắn thời gian hồi phục.' },
  { icon: 'care' as IconName, title: 'Điều trị rò hậu môn / nứt kẽ không tái phát.', text: 'Theo dõi toàn diện từ chẩn đoán, điều trị đến chăm sóc sau thủ thuật.' },
];

export function SpecialtyServices() {
  return (
    <section className="specialty-services" id="dich-vu">
      <div className="specialty-container">
        <div className="specialty-section-heading">
          <span>GIẢI PHÁP CHUYÊN SÂU</span>
          <h2>Dịch vụ được thiết kế cho sự riêng tư và an tâm</h2>
          <p>Mỗi người bệnh được lắng nghe kỹ lưỡng và đồng hành bởi đội ngũ chuyên khoa giàu kinh nghiệm.</p>
        </div>
        <div className="specialty-service-grid">
          {services.map((service, index) => (
            <article className="specialty-service-card" key={service.title}>
              <div className="specialty-service-top"><span>0{index + 1}</span><div className="specialty-icon-wrap"><MedicalIcon name={service.icon} /></div></div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <Link to="/dat-lich">Tìm hiểu thêm <MedicalIcon name="arrow" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

type BookingFormProps = { compact?: boolean };

export function SpecialtyBookingForm({ compact = false }: BookingFormProps) {
  const [form, setForm] = useState({ name: '', phone: '', symptoms: '', preferredDoctorGender: 'Không yêu cầu' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE}/api/booking-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.replace(/\D/g, ''),
          reason: form.symptoms.trim(),
          preferredDoctorGender: form.preferredDoctorGender,
          note: 'Yêu cầu tư vấn ẩn danh từ landing page chuyên khoa Hậu môn - Trực tràng.',
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
      setMessage({ type: 'success', text: `Đã tiếp nhận yêu cầu${data.requestCode ? ` ${data.requestCode}` : ''}. Nhân viên sẽ liên hệ bảo mật với bạn.` });
      setForm({ name: '', phone: '', symptoms: '', preferredDoctorGender: 'Không yêu cầu' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={compact ? 'specialty-booking specialty-booking--compact' : 'specialty-booking'} id="tu-van">
      <div className="specialty-container specialty-booking-layout">
        <div className="specialty-booking-copy">
          <span className="specialty-kicker">TƯ VẤN RIÊNG TƯ</span>
          <h2>Chia sẻ điều bạn đang băn khoăn</h2>
          <p>Để lại thông tin tối thiểu. Chúng tôi chỉ sử dụng dữ liệu để tư vấn và xác nhận lịch khám.</p>
          <div className="specialty-privacy-note"><MedicalIcon name="lock" /><span><strong>Bảo mật từ bước đầu tiên</strong><small>Không hiển thị thông tin của bạn công khai.</small></span></div>
        </div>
        <form className="specialty-booking-form" onSubmit={submit}>
          <div className="specialty-form-grid">
            <label>Họ tên<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nhập họ tên" /></label>
            <label>Số điện thoại<input required inputMode="tel" pattern="0[0-9]{9}" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="09xxxxxxxx" /></label>
          </div>
          <label>Triệu chứng<textarea required value={form.symptoms} onChange={(event) => update('symptoms', event.target.value)} placeholder="Mô tả ngắn triệu chứng hoặc điều bạn lo lắng" rows={3} /></label>
          <fieldset className="specialty-gender-fieldset">
            <legend>Yêu cầu Bác sĩ</legend>
            <div className="specialty-radio-group">
              {['Nam', 'Nữ', 'Không yêu cầu'].map((value) => <label key={value}><input type="radio" name="preferredDoctorGender" value={value} checked={form.preferredDoctorGender === value} onChange={(event) => update('preferredDoctorGender', event.target.value)} /> <span>{value}</span></label>)}
            </div>
          </fieldset>
          {message && <p className={`specialty-form-message is-${message.type}`}>{message.text}</p>}
          <button className="specialty-submit" type="submit" disabled={submitting}>{submitting ? 'Đang gửi thông tin...' : 'Gửi yêu cầu tư vấn'} <MedicalIcon name="arrow" /></button>
          <p className="specialty-commitment">🔒 Cam kết bảo mật thông tin 100% | Khám mô hình 1 Bác sĩ - 1 Bệnh nhân</p>
        </form>
      </div>
    </section>
  );
}

export function SpecialtyLandingPage() {
  return (
    <main className="specialty-landing">
      <section className="specialty-hero">
        <div className="specialty-container specialty-hero-content">
          <div className="specialty-hero-copy">
            <span className="specialty-kicker">TRUNG TÂM CHUYÊN SÂU TÂM AN</span>
            <h1>Chuyên Khoa Hậu Môn<br />Trực Tràng Hàng Đầu</h1>
            <p>Điều trị tận gốc - Xóa bỏ nỗi lo thầm kín bằng công nghệ không đau.</p>
            <div className="specialty-hero-actions"><Link className="specialty-button specialty-button--primary" to="/dat-lich">Tư vấn ẩn danh <MedicalIcon name="arrow" /></Link><Link className="specialty-button specialty-button--light" to="/dat-lich">Đặt lịch khám bảo mật <MedicalIcon name="arrow" /></Link></div>
            <div className="specialty-hero-trust"><span>✓ Đội ngũ chuyên gia</span><span>✓ Quy trình kín đáo</span><span>✓ Hẹn riêng 1-1</span></div>
          </div>
          <div className="specialty-hero-card"><span>CHĂM SÓC RIÊNG TƯ</span><strong>01</strong><p>Không gian thăm khám kín đáo, tôn trọng và lắng nghe mọi vấn đề nhạy cảm.</p><Link to="/dat-lich">Bắt đầu tư vấn <MedicalIcon name="arrow" /></Link></div>
        </div>
      </section>
      <SpecialtyServices />
      <SpecialtyBookingForm />
    </main>
  );
}

export function SpecialtyBookingPage() {
  return <main className="specialty-booking-page"><SpecialtyBookingForm /><section className="specialty-booking-help"><div className="specialty-container"><span>☎</span><p>Cần hỗ trợ ngay? Gọi <a href="tel:0977335599">0977 33 55 99</a> để được tiếp nhận riêng tư.</p></div></section></main>;
}
