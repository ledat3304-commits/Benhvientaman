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
            <span className="eyebrow">Dịch vụ</span>
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
