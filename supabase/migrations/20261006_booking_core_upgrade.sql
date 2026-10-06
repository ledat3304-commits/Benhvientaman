-- Mở rộng dữ liệu phục vụ booking bác sĩ.
-- Không DROP bảng và không xóa dữ liệu hiện tại.

BEGIN;

ALTER TABLE bacsi ADD COLUMN IF NOT EXISTS hocvi varchar(50);
ALTER TABLE bacsi ADD COLUMN IF NOT EXISTS chucdanh varchar(100);
ALTER TABLE bacsi ADD COLUMN IF NOT EXISTS chuyenmon text;
ALTER TABLE bacsi ADD COLUMN IF NOT EXISTS anhdaidien text;
ALTER TABLE bacsi ADD COLUMN IF NOT EXISTS phidatlich numeric(15,2) NOT NULL DEFAULT 0;
ALTER TABLE bacsi ADD COLUMN IF NOT EXISTS thoiluongkham integer NOT NULL DEFAULT 30;
ALTER TABLE bacsi ADD COLUMN IF NOT EXISTS noibat boolean NOT NULL DEFAULT false;
ALTER TABLE bacsi ADD COLUMN IF NOT EXISTS hoatdong boolean NOT NULL DEFAULT true;

ALTER TABLE lichkham ADD COLUMN IF NOT EXISTS phibacsitaithoidiem numeric(15,2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bacsi_active_specialty
    ON bacsi(hoatdong, chuyenkhoaid);

COMMIT;
