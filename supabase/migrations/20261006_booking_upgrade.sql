-- Nâng cấp an toàn cho luồng đặt lịch khám.
-- Không xóa dữ liệu cũ và không chạy lại benhvientaman_supabase.sql.

BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
          FROM lichkham
         WHERE COALESCE(trangthai, '') <> 'DaHuy'
         GROUP BY bacsiid, thoigiankham
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Không thể tạo unique index: dữ liệu hiện tại có lịch bị trùng slot.';
    END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_lichkham_active_doctor_time
    ON lichkham (bacsiid, thoigiankham)
    WHERE COALESCE(trangthai, '') <> 'DaHuy';

COMMIT;