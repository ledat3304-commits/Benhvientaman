-- Đồng bộ danh sách chuyên khoa hoạt động với frontend /chuyen-khoa.
-- Không xóa dữ liệu cũ và không xóa các liên kết bác sĩ, dịch vụ hoặc lịch khám.

BEGIN;

ALTER TABLE chuyenkhoa
    ADD COLUMN IF NOT EXISTS hoatdong boolean NOT NULL DEFAULT true;

-- Giữ nguyên ID hiện có để bảo toàn các khóa ngoại đang tham chiếu.
UPDATE chuyenkhoa SET tenchuyenkhoa = 'Khoa Nội Tổng Hợp' WHERE chuyenkhoaid = 1;
UPDATE chuyenkhoa SET tenchuyenkhoa = 'Khoa Ngoại Tổng Hợp' WHERE chuyenkhoaid = 2;
UPDATE chuyenkhoa SET tenchuyenkhoa = 'Khoa Nhi' WHERE chuyenkhoaid = 3;
UPDATE chuyenkhoa SET tenchuyenkhoa = 'Khoa Thận - Lọc Máu' WHERE chuyenkhoaid = 14;
UPDATE chuyenkhoa SET tenchuyenkhoa = 'Khoa Gây Mê Hồi Sức' WHERE chuyenkhoaid = 26;
UPDATE chuyenkhoa SET tenchuyenkhoa = 'Cận lâm sàng - Chẩn đoán hình ảnh' WHERE chuyenkhoaid = 27;
UPDATE chuyenkhoa SET tenchuyenkhoa = 'Khoa Xét Nghiệm' WHERE chuyenkhoaid = 28;
UPDATE chuyenkhoa SET tenchuyenkhoa = 'Y học cổ truyền & Phục hồi chức năng' WHERE chuyenkhoaid = 29;

-- Đồng bộ sequence sau khi dữ liệu cũ đã được import bằng ID thủ công.
-- Nếu không có bước này, bản ghi mới có thể cố dùng lại chuyenkhoaid = 1.
SELECT setval(
    pg_get_serial_sequence('chuyenkhoa', 'chuyenkhoaid'),
    COALESCE(MAX(chuyenkhoaid), 1),
    MAX(chuyenkhoaid) IS NOT NULL
)
FROM chuyenkhoa;

-- Các mục mới trên frontend, thêm vào database hiện tại bằng ID mới.
INSERT INTO chuyenkhoa (tenchuyenkhoa, mota, hoatdong)
VALUES
    ('Khoa Khám Bệnh', 'Tiếp nhận, tư vấn và định hướng khám chữa bệnh phù hợp.', true),
    ('Khoa Dược', 'Đảm bảo cung ứng và sử dụng thuốc an toàn, hợp lý, hiệu quả.', true),
    ('Chuyên Khoa Hậu Môn - Trực Tràng', 'Thông tin chuyên môn và hướng dẫn chăm sóc sức khỏe hậu môn - trực tràng.', true)
ON CONFLICT (tenchuyenkhoa) DO UPDATE SET
    mota = EXCLUDED.mota,
    hoatdong = true;

-- Chỉ 11 tên dưới đây được phép xuất hiện trong danh sách chuyên khoa hoạt động.
UPDATE chuyenkhoa
   SET hoatdong = CASE
       WHEN tenchuyenkhoa IN (
           'Khoa Nội Tổng Hợp',
           'Khoa Ngoại Tổng Hợp',
           'Khoa Nhi',
           'Y học cổ truyền & Phục hồi chức năng',
           'Khoa Thận - Lọc Máu',
           'Khoa Khám Bệnh',
           'Khoa Gây Mê Hồi Sức',
           'Cận lâm sàng - Chẩn đoán hình ảnh',
           'Khoa Xét Nghiệm',
           'Khoa Dược',
           'Chuyên Khoa Hậu Môn - Trực Tràng'
       ) THEN true
       ELSE false
   END;

DO $$
DECLARE
    active_count integer;
BEGIN
    SELECT COUNT(*)
      INTO active_count
      FROM chuyenkhoa
     WHERE hoatdong = true;

    IF active_count <> 11 THEN
        RAISE EXCEPTION 'Đồng bộ chuyên khoa không đạt: đang có % chuyên khoa hoạt động, cần đúng 11.', active_count;
    END IF;
END;
$$;

COMMIT;
