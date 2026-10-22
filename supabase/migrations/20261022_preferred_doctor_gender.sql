-- Lưu lựa chọn giới tính bác sĩ mong muốn của người bệnh khi gửi yêu cầu tư vấn.
BEGIN;

ALTER TABLE yeucaudatlich
  ADD COLUMN IF NOT EXISTS gioitinhbacsimongmuon varchar(20);

ALTER TABLE yeucaudatlich
  DROP CONSTRAINT IF EXISTS ck_yeucaudatlich_doctor_gender;

ALTER TABLE yeucaudatlich
  ADD CONSTRAINT ck_yeucaudatlich_doctor_gender
  CHECK (gioitinhbacsimongmuon IS NULL OR gioitinhbacsimongmuon IN ('Nam', 'Nữ', 'Không yêu cầu'));

COMMIT;
