# Deploy Backend lên Render

Project đã có backend Express tại `backend/`. Không tạo database mới và không chạy các lệnh xoá dữ liệu.

## 1. Tạo Web Service

- Kết nối repository GitHub chứa project.
- Runtime: `Node`.
- Root Directory: `backend`.
- Build Command: `npm install`.
- Start Command: `npm start`.
- Health Check Path: `/api/health`.

File `render.yaml` trong project đã chứa cấu hình tương ứng.

## 2. Environment Variables trên Render

Thiết lập các biến sau trong Render, không commit giá trị thật vào Git:

```env
NODE_ENV=production
APP_TIMEZONE=Asia/Ho_Chi_Minh
PORT=10000
FRONTEND_URL=https://frontend-benhvientaman.vercel.app
DATABASE_URL=<Supabase PostgreSQL connection string>
DB_SSL=true
```

Để Render tự cấp `PORT`; backend luôn đọc `process.env.PORT`. Không cần đặt cứng cổng trong dashboard.

Nếu cần cho các tích hợp server-side, bổ sung `SUPABASE_URL`, `SUPABASE_ANON_KEY` và `SUPABASE_SERVICE_ROLE_KEY`. Backend hiện dùng PostgreSQL qua `DATABASE_URL`; không đưa các biến này vào frontend.

## 3. Đồng bộ schema Supabase

Trong Supabase SQL Editor, kiểm tra các migration hiện có và chạy theo thứ tự:

1. `supabase/migrations/20260922_admin_notifications.sql`
2. `supabase/migrations/20261006_booking_core_upgrade.sql`
3. `supabase/migrations/20261006_booking_requests.sql`
4. `supabase/migrations/20261006_booking_upgrade.sql`
5. `supabase/migrations/20261006_service_specialty_mapping.sql`

Các migration này dùng `IF NOT EXISTS`/kiểm tra constraint để giữ dữ liệu hiện tại. Không chạy `benhvientaman_supabase.sql` trên database production vì file seed cũ có thao tác xoá bảng.

## 4. Kiểm tra backend

Sau khi Render deploy xong, mở:

```text
https://<backend-domain>.onrender.com/api/health
```

Kết quả hợp lệ có dạng:

```json
{
  "status": "ok",
  "database": "connected",
  "schema": "ready"
}
```

Nếu trả `schema: incomplete`, chạy đúng các migration ở bước 3 rồi kiểm tra lại. Không đưa thông tin connection string vào log hoặc ảnh chụp màn hình.

## 5. Kết nối Vercel

Trong Vercel → Project → Settings → Environment Variables, thêm cho Production:

```env
VITE_API_URL=https://<backend-domain>.onrender.com
```

Sau đó Redeploy frontend. Không dùng `http://localhost:8000` trên Production. Backend cần đặt:

```env
FRONTEND_URL=https://frontend-benhvientaman.vercel.app
```

Nếu dùng thêm domain frontend, đưa các domain vào `FRONTEND_URLS`, phân tách bằng dấu phẩy.

## 6. Kiểm tra luồng đặt lịch

- Gọi `GET /api/health` và xác nhận `status`, `database`, `schema` đều sẵn sàng.
- Mở `/dat-lich` trên Vercel và kiểm tra danh sách chuyên khoa, dịch vụ, bác sĩ.
- Gửi một yêu cầu hợp lệ; chỉ hiển thị thành công khi backend trả `201` sau khi ghi database.
- Đăng nhập `/admin`; kiểm tra yêu cầu trong danh sách admin và thông báo trong hộp thư.
- Kiểm tra đặt lịch có đủ bác sĩ/ngày/giờ: slot trùng phải trả `409`, không tạo bản ghi thứ hai.
- Kiểm tra yêu cầu thiếu dữ liệu hoặc số điện thoại không đúng 10 chữ số bị từ chối.

Không dùng dữ liệu bệnh nhân thật để thử nghiệm và không thực hiện thao tác ghi/xoá trên database production nếu chưa được cho phép.
