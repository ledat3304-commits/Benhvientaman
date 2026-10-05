import { Link } from 'react-router-dom';

const specialtyHighlights = [
  { title: 'Hậu môn – Trực tràng', description: 'Khám và điều trị bệnh trĩ, rò hậu môn, áp xe hậu môn.', image: '/specialties/02_ngoai_tong_hop.png', href: '/benh-ly' },
  { title: 'Tiêu hóa', description: 'Tầm soát và điều trị bệnh lý dạ dày, đại tràng, gan mật.', image: '/specialties/08_chan_doan_hinh_anh.png', href: '/chuyen-khoa' },
  { title: 'Tim mạch', description: 'Theo dõi, chẩn đoán và điều trị bệnh lý tim mạch.', image: '/specialties/01_noi_tong_hop.png', href: '/chuyen-khoa' },
  { title: 'Nội tổng quát', description: 'Chăm sóc sức khỏe toàn diện cho người trưởng thành.', image: '/specialties/01_noi_tong_hop.png', href: '/khoa/khoa-noi-tong-hop' },
];

const healthKnowledge = [
  { title: 'Bệnh trĩ: dấu hiệu nhận biết và khi nào nên đi khám', image: '/medical/benh-tri.png', href: '/benh-ly/benh-tri' },
  { title: 'Rò hậu môn: nguyên nhân và hướng xử trí', image: '/medical/ro-hau-mon.svg', href: '/benh-ly/ro-hau-mon' },
  { title: 'Áp xe hậu môn: dấu hiệu cần khám sớm', image: '/medical/ap-xe-hau-mon.svg', href: '/benh-ly/ap-xe-hau-mon' },
];

export function SpecialtyHighlightsSection() {
  return (
    <section className="section home-specialties-section" id="chuyen-khoa-noi-bat">
      <div className="container">
        <div className="home-specialties-heading">
          <div>
            <span className="eyebrow">Chuyên khoa nổi bật</span>
            <h2>CHUYÊN KHOA NỔI BẬT</h2>
            <p>Đội ngũ chuyên môn phối hợp để mang đến hướng thăm khám phù hợp cho từng nhu cầu sức khỏe.</p>
          </div>
          <Link to="/chuyen-khoa" className="button button-primary">Xem tất cả <span>→</span></Link>
        </div>
        <div className="home-specialties-grid">
          {specialtyHighlights.map((item, index) => (
            <Link className="home-specialty-card" to={item.href} key={item.title}>
              <div className="home-specialty-icon"><img src={item.image} alt="" aria-hidden="true" /></div>
              <span className="home-specialty-number">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <b>Xem chi tiết <i>→</i></b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseSection() {
  return (
    <section className="section home-why-section" id="tai-sao-chon-tam-an">
      <div className="container home-why-grid">
        <div className="home-why-content">
          <span className="eyebrow">Tại sao chọn Tâm An</span>
          <h2>TẬN TÂM TRONG TỪNG TRẢI NGHIỆM</h2>
          <p className="home-why-lead">Tâm An xây dựng môi trường y tế hiện đại, nơi người bệnh được lắng nghe, tư vấn rõ ràng và chăm sóc bằng tất cả sự tận tâm.</p>
          <ul className="home-why-list">
            <li><b>✓</b><span><strong>Bác sĩ chuyên môn</strong><small>Đội ngũ giàu kinh nghiệm, phối hợp chặt chẽ.</small></span></li>
            <li><b>✓</b><span><strong>Thiết bị hiện đại</strong><small>Hỗ trợ chẩn đoán và điều trị chính xác, kịp thời.</small></span></li>
            <li><b>✓</b><span><strong>Quy trình thuận tiện</strong><small>Đặt lịch nhanh, hướng dẫn rõ ràng, minh bạch.</small></span></li>
            <li><b>✓</b><span><strong>Chăm sóc tận tâm</strong><small>Đồng hành trước, trong và sau quá trình điều trị.</small></span></li>
          </ul>
          <Link to="/gioi-thieu" className="button button-outline">Tìm hiểu về Tâm An <span>→</span></Link>
        </div>
        <div className="home-why-panel">
          <strong>50<span>+</span></strong><p>Bác sĩ chuyên khoa</p>
          <strong>25.000</strong><p>Người bệnh tin chọn</p>
          <strong>98<span>%</span></strong><p>Hài lòng dịch vụ</p>
        </div>
      </div>
    </section>
  );
}

export function HealthKnowledgeSection() {
  return (
    <section className="section home-knowledge-section" id="kien-thuc-suc-khoe">
      <div className="container">
        <div className="home-knowledge-heading">
          <div>
            <span className="eyebrow">Kiến thức sức khỏe</span>
            <h2>KIẾN THỨC SỨC KHỎE</h2>
            <p>Thông tin y khoa dễ hiểu giúp bạn chủ động nhận biết dấu hiệu và chăm sóc sức khỏe đúng cách.</p>
          </div>
          <Link to="/benh-ly" className="button button-outline">Xem tất cả <span>→</span></Link>
        </div>
        <div className="home-knowledge-grid">
          {healthKnowledge.map((item) => (
            <Link className="home-knowledge-card" to={item.href} key={item.title}>
              <div className="home-knowledge-image"><img src={item.image} alt={item.title} loading="lazy" /></div>
              <div><h3>{item.title}</h3><b>Đọc bài viết <i>→</i></b></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const homeServiceGroups = [
  {
    icon: '✦',
    title: 'Sàng lọc, chẩn đoán và thăm dò chức năng',
    items: [
      'Gói tầm soát và chẩn đoán sớm ung thư',
      'Gói nội soi tiêu hóa gây mê kèm tầm soát ung thư',
    ],
  },
  {
    icon: '✚',
    title: 'Phẫu thuật và điều trị bệnh lý',
    items: [
      'Chẩn đoán và điều trị bệnh lý đại trực tràng - hậu môn',
      'Phẫu thuật điều trị bệnh trĩ và các bệnh lý hậu môn',
      'Phẫu thuật điều trị rò hậu môn, áp xe và sa trực tràng',
    ],
  },
];

export function ServicePackagesSection() {
  return (
    <section className="section home-services-section" id="dich-vu">
      <div className="container">
        <div className="home-services-heading">
          <div>
            <span className="eyebrow">Dịch vụ và các gói khám bệnh</span>
            <h2>Dịch vụ và các gói khám bệnh</h2>
            <p>Chủ động chăm sóc sức khỏe với các gói khám và hướng điều trị được xây dựng theo từng nhu cầu.</p>
          </div>
          <Link to="/dat-lich" className="button button-outline">Đặt lịch tư vấn <span>→</span></Link>
        </div>
        <div className="home-service-grid">
          {homeServiceGroups.map((group, index) => (
            <article className={`home-service-card home-service-card--${index + 1}`} key={group.title}>
              <div className="home-service-icon">{group.icon}</div>
              <span className="home-service-number">0{index + 1}</span>
              <h3>{group.title}</h3>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              <Link to="/dat-lich" className="home-service-link">Xem gói khám <b>→</b></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamSection() {
  return (
    <section className="section home-team-section" id="doi-ngu">
      <div className="container">
        <div className="home-team-heading">
          <div>
            <span className="eyebrow">Đội ngũ nhân sự</span>
            <h2>Những người đồng hành cùng sức khỏe của bạn</h2>
            <p>Đội ngũ quản lý và chuyên môn phối hợp chặt chẽ, đặt sự an toàn và an tâm của người bệnh làm trọng tâm.</p>
          </div>
          <Link to="/gioi-thieu#lanh-dao" className="button button-primary">Xem đội ngũ <span>→</span></Link>
        </div>
        <div className="home-team-banner-wrap">
          <img className="home-team-banner" src="/hospital/leadership-team-banner.png" alt="Ban lãnh đạo Bệnh viện Đa khoa Tâm An" />
        </div>
      </div>
    </section>
  );
}

export function NewsEventsSection() {
  return (
    <section className="section home-news-section" id="tin-tuc-su-kien">
      <div className="container">
        <div className="home-news-heading">
          <div>
            <span className="eyebrow">Tin tức Sự kiện</span>
            <h2>Tin tức Sự kiện</h2>
            <p>Cập nhật những hoạt động chuyên môn, hội nghị và dấu ấn nổi bật của Bệnh viện Đa khoa Tâm An.</p>
          </div>
          <Link to="/cam-nang" className="button button-outline">Xem tất cả <span>→</span></Link>
        </div>
        <article className="home-news-card">
          <div className="home-news-image"><img src="/news/hoi-nghi-khoa-hoc-2025.jpg" alt="Hội nghị Khoa học Hậu môn – Trực tràng toàn quốc lần thứ XIII" /></div>
          <div className="home-news-content">
            <span className="home-news-date">11.10.2025 · Thanh Hóa</span>
            <h3>Hội nghị Khoa học Hậu môn – Trực tràng toàn quốc lần thứ XIII</h3>
            <p>Hội nghị kết nối các chuyên gia, nhà khoa học và bác sĩ để chia sẻ những tiến bộ trong chẩn đoán, điều trị và chăm sóc người bệnh.</p>
            <Link to="/cam-nang" className="home-news-link">Đọc tin tức <b>→</b></Link>
          </div>
        </article>
      </div>
    </section>
  );
}
