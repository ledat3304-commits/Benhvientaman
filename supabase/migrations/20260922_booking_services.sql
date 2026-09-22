-- Bổ sung các dịch vụ hiển thị trong form Đặt lịch khám.
-- Giá để 0 vì chưa có bảng giá chính thức; admin có thể cập nhật sau.

BEGIN;

-- Đồng bộ sequence sau khi dữ liệu dịch vụ đã được import thủ công.
SELECT setval(
    pg_get_serial_sequence('danhmucdichvu', 'dichvuid'),
    COALESCE(MAX(dichvuid), 1),
    MAX(dichvuid) IS NOT NULL
)
FROM danhmucdichvu;

INSERT INTO danhmucdichvu (tendichvu, mota, dongia, hoatdong)
VALUES
    ('Gói Tầm Soát Và Chẩn Đoán Sớm Ung Thư', 'Gói tầm soát và chẩn đoán sớm các nguy cơ ung thư.', 0, true),
    ('Gói Nội Soi Tiêu Hóa Gây Mê (Dạ Dày, Đại Tràng) Kèm Tầm Soát Ung Thư', 'Nội soi tiêu hóa gây mê kết hợp tầm soát ung thư.', 0, true),
    ('Chẩn Đoán Và Điều Trị Ung Thư Đại Trực Tràng - Hậu Môn', 'Tư vấn, chẩn đoán và điều trị bệnh lý ung thư đại trực tràng - hậu môn.', 0, true),
    ('Phẫu Thuật Điều Trị Bệnh Trĩ Triệt Để (Các Phương Pháp)', 'Tư vấn và phẫu thuật điều trị bệnh trĩ theo chỉ định chuyên môn.', 0, true),
    ('Phẫu Thuật Điều Trị Rò Hậu Môn Các Thể', 'Phẫu thuật điều trị các thể rò hậu môn.', 0, true),
    ('Phẫu Thuật Điều Trị Áp Xe Hậu Môn', 'Điều trị ngoại khoa áp xe hậu môn theo tình trạng người bệnh.', 0, true),
    ('Phẫu Thuật Điều Trị Sa Niêm Mạc Trực Tràng Và Sa Trực Tràng', 'Tư vấn và phẫu thuật điều trị sa niêm mạc, sa trực tràng.', 0, true),
    ('Phẫu Thuật Cắt Polyp Hậu Môn - Trực Tràng', 'Cắt và xử lý polyp hậu môn - trực tràng theo chỉ định.', 0, true)
ON CONFLICT (tendichvu) DO UPDATE SET
    mota = EXCLUDED.mota,
    hoatdong = true;

COMMIT;
