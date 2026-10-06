-- Link active booking services to existing specialties only.
-- This migration does not create, rename, delete, or reset specialties.

BEGIN;

ALTER TABLE danhmucdichvu
    ADD COLUMN IF NOT EXISTS chuyenkhoaid integer;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_constraint
         WHERE conname = 'fk_danhmucdichvu_chuyenkhoa'
           AND conrelid = 'danhmucdichvu'::regclass
    ) THEN
        ALTER TABLE danhmucdichvu
            ADD CONSTRAINT fk_danhmucdichvu_chuyenkhoa
            FOREIGN KEY (chuyenkhoaid)
            REFERENCES chuyenkhoa(chuyenkhoaid)
            ON DELETE SET NULL;
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_danhmucdichvu_specialty_active
    ON danhmucdichvu(chuyenkhoaid, hoatdong);

-- These mappings are based on the existing service names and existing
-- specialty names/IDs in the production database.
UPDATE danhmucdichvu SET chuyenkhoaid = 1 WHERE dichvuid = 1;  -- Khám tổng quát -> Nội tổng quát
UPDATE danhmucdichvu SET chuyenkhoaid = 5 WHERE dichvuid = 2;  -- Khám tim mạch -> Tim mạch
UPDATE danhmucdichvu SET chuyenkhoaid = 6 WHERE dichvuid = 3;  -- Khám da liễu -> Da liễu
UPDATE danhmucdichvu SET chuyenkhoaid = 13 WHERE dichvuid = 4; -- Khám tiêu hóa -> Tiêu hóa
UPDATE danhmucdichvu SET chuyenkhoaid = 9 WHERE dichvuid = 5;  -- Khám mắt -> Mắt
UPDATE danhmucdichvu SET chuyenkhoaid = 28 WHERE dichvuid = 6; -- Xét nghiệm máu -> Xét nghiệm y học
UPDATE danhmucdichvu SET chuyenkhoaid = 27 WHERE dichvuid = 7; -- Siêu âm -> Chẩn đoán hình ảnh
UPDATE danhmucdichvu SET chuyenkhoaid = 11 WHERE dichvuid = 8; -- Tầm soát ung thư -> Ung bướu
UPDATE danhmucdichvu SET chuyenkhoaid = 13 WHERE dichvuid = 9; -- Nội soi tiêu hóa -> Tiêu hóa
UPDATE danhmucdichvu SET chuyenkhoaid = 11 WHERE dichvuid = 10; -- Ung thư đại trực tràng -> Ung bướu

-- Services 11-15 are intentionally left NULL: the database has no exact
-- "Hậu môn – Trực tràng" specialty and they must not be guessed into another one.

COMMIT;
