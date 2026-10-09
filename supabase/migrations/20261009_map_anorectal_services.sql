-- Gán 5 dịch vụ hậu môn - trực tràng vào chuyên khoa tương ứng.
-- Không xóa dịch vụ, không thay đổi trạng thái hoạt động và không ảnh hưởng lịch đã đặt.

BEGIN;

DO $$
DECLARE
    specialty_id integer;
    updated_count integer;
BEGIN
    SELECT chuyenkhoaid
      INTO specialty_id
      FROM chuyenkhoa
     WHERE tenchuyenkhoa = 'Chuyên Khoa Hậu Môn - Trực Tràng'
       AND COALESCE(hoatdong, true) = true
     LIMIT 1;

    IF specialty_id IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy chuyên khoa hoạt động: Chuyên Khoa Hậu Môn - Trực Tràng';
    END IF;

    UPDATE danhmucdichvu
       SET chuyenkhoaid = specialty_id
     WHERE tendichvu IN (
         'Phẫu Thuật Điều Trị Bệnh Trĩ Triệt Để (Các Phương Pháp)',
         'Phẫu Thuật Điều Trị Rò Hậu Môn Các Thể',
         'Phẫu Thuật Điều Trị Áp Xe Hậu Môn',
         'Phẫu Thuật Điều Trị Sa Niêm Mạc Trực Tràng Và Sa Trực Tràng',
         'Phẫu Thuật Cắt Polyp Hậu Môn - Trực Tràng'
     );

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count <> 5 THEN
        RAISE EXCEPTION 'Cần cập nhật đúng 5 dịch vụ hậu môn - trực tràng, nhưng đã cập nhật %.', updated_count;
    END IF;
END;
$$;

COMMIT;
