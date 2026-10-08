import { Link } from 'react-router-dom';

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

export function InsuranceSection() {
  return (
    <section className="section home-insurance-section" id="bao-hiem-y-te">
      <div className="container">
        <div className="home-insurance-card">
          <div className="home-insurance-content">
            <span className="eyebrow">Bảo hiểm y tế</span>
            <h2>BẢO HIỂM Y TẾ</h2>
            <p>Hiểu rõ quyền lợi, thủ tục và quy trình sử dụng bảo hiểm y tế khi thăm khám tại Bệnh viện Tâm An.</p>
            <ul>
              <li>Hướng dẫn thủ tục BHYT rõ ràng, dễ thực hiện</li>
              <li>Thông tin quyền lợi và phạm vi hỗ trợ minh bạch</li>
            </ul>
            <Link to="/bao-hiem" className="button button-primary">Xem thông tin BHYT <span>→</span></Link>
          </div>
          <div className="home-insurance-image">
            <img src="/hospital/bhyt-quyen-loi.jpg" alt="Quyền lợi bảo hiểm y tế tại Bệnh viện Tâm An" loading="lazy" />
          </div>
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
