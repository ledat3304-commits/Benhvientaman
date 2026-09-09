# Hệ thống Quản lý Bệnh viện Tâm An

Đây là một dự án ứng dụng web được xây dựng bằng PHP thuần theo mô hình MVC, nhằm mục đích cung cấp một giải pháp toàn diện cho việc quản lý và vận hành một phòng khám đa khoa. Hệ thống phục vụ ba vai trò người dùng chính: **Bệnh nhân**, **Bác sĩ**, và **Quản trị viên**.

## I. Tính năng chính

### 1. Đối với Bệnh nhân
- **Quản lý tài khoản:** Đăng ký, đăng nhập, đăng xuất, quản lý hồ sơ cá nhân và thông tin sức khỏe (tiền sử bệnh, dị ứng).
- **Đặt lịch hẹn:** Tìm kiếm bác sĩ theo chuyên khoa, xem lịch làm việc và đặt lịch hẹn trực tuyến vào các khung giờ còn trống.
- **Quản lý lịch hẹn:** Xem danh sách các lịch hẹn sắp tới, lịch sử các cuộc hẹn đã hoàn thành, và tùy chọn hủy lịch hẹn.
- **Xem hồ sơ bệnh án:** Truy cập (một cách an toàn) vào kết quả chẩn đoán, đơn thuốc và lời dặn của bác sĩ sau mỗi lần khám.

### 2. Đối với Bác sĩ
- **Bảng điều khiển (Dashboard):** Giao diện tổng quan, hiển thị các lịch hẹn trong ngày.
- **Quản lý lịch hẹn:** Xem, xác nhận và cập nhật trạng thái các lịch hẹn của bệnh nhân.
- **Khám bệnh & Lập hồ sơ:** Ghi nhận triệu chứng, chẩn đoán, chỉ định dịch vụ, kê đơn thuốc và ghi chú cho mỗi lần khám.
- **Quản lý lịch làm việc:** Tự cấu hình các khung giờ làm việc cố định trong tuần.
- **Quản lý bệnh nhân:** Xem danh sách và lịch sử khám của các bệnh nhân mình đã điều trị.

### 3. Đối với Quản trị viên
- **Quản lý Bác sĩ:** Thêm, sửa, xóa và quản lý tài khoản, hồ sơ của các bác sĩ.
- **Quản lý Chuyên khoa:** Quản lý danh mục các chuyên khoa của phòng khám.
- **Quản lý Dịch vụ:** Quản lý danh mục các dịch vụ khám chữa bệnh cùng đơn giá.
- **Quản lý Thuốc:** Quản lý danh mục các loại thuốc có trong hệ thống.

## II. Công nghệ sử dụng

- **Ngôn ngữ:** PHP 8.1+
- **Cơ sở dữ liệu:** MySQL
- **Frontend:**
  - HTML5, CSS3, JavaScript (ES6)
  - [Bootstrap 5](https://getbootstrap.com/)
  - [Font Awesome 6](https://fontawesome.com/)
- **Backend:**
  - Xây dựng trên PHP thuần theo kiến trúc MVC.
  - **Templating Engine:** [Plates](https://platesphp.com/)
  - **Gửi Email:** [PHPMailer](https://github.com/PHPMailer/PHPMailer)
  - **Quản lý biến môi trường:** [PHP dotenv](https://github.com/vlucas/phpdotenv)
- **Công cụ:** [Composer](https://getcomposer.org/) để quản lý các thư viện.

## III. Cấu trúc dự án

Dự án được tổ chức theo mô hình MVC (Model-View-Controller) để đảm bảo sự tách biệt rõ ràng giữa logic nghiệp vụ, xử lý dữ liệu và giao diện người dùng.

- `app/`: Chứa toàn bộ mã nguồn chính của ứng dụng.
  - `Controllers/`: Xử lý các yêu cầu từ người dùng, gọi Model và truyền dữ liệu cho View.
  - `Models/`: Tương tác trực tiếp với cơ sở dữ liệu.
  - `Views/`: Chứa các file giao diện (HTML/PHP).
- `core/`: Chứa các lớp lõi của framework (Router, Database, Request...).
- `public/`: Là thư mục gốc của web server, chứa các tài sản công khai (CSS, JS, images) và file `index.php` (Front Controller).
- `config/`: Chứa các file cấu hình (kết nối CSDL, mail...).
- `vendor/`: Chứa các thư viện được cài đặt bởi Composer.

## IV. Hướng dẫn cài đặt

1.  **Clone Repository**
    ```bash
    git clone <your-repository-url>
    cd benhvientaman
    ```

2.  **Cài đặt các thư viện PHP**
    ```bash
    composer install
    ```

3.  **Cấu hình môi trường**
    -   Tạo một file `database.php` trong thư mục gốc của dự án bằng cách sao chép từ file `database.php` hoặc tạo mới.
    -   Cấu hình thông tin kết nối cơ sở dữ liệu trong file `database.php`:
    ```
        DB_HOST=localhost
        DB_PORT=3306
        DB_DATABASE=doan1
        DB_USERNAME=root
        DB_PASSWORD=
        ```

4.  **Cơ sở dữ liệu**
    -   Tạo một cơ sở dữ liệu mới (ví dụ: `doan1`) trong MySQL
    -   Import dữ liệu từ file `doan1.sql` vào cơ sở dữ liệu vừa tạo.

5.  **Cấu hình Web Server**
    Bạn có thể chạy ứng dụng theo một trong hai cách sau:
    ***Cách 1: Sử dụng máy chủ PHP tích hợp (Khuyên dùng cho phát triển)***
    Đây là cách đơn giản và nhanh nhất để khởi động dự án. Mở terminal tại thư mục gốc của dự án và chạy lệnh sau:

    ````bash
    php -S localhost:8000 -t public
    ````
    ***Cách 2: Sử dụng máy chủ web như Apache hoặc Nginx***
    Đối với môi trường production hoặc nếu bạn đang dùng các công cụ như XAMPP, WAMP, hãy cấu hình máy chủ web của bạn:
    -   Document Root: Trỏ Document Root (thư mục gốc) của virtual host đến thư mục `public` của dự án.
    -   URL Rewriting: Đảm bảo đã bật mod_rewrite (đối với Apache) để các URL thân thiện của ứng dụng hoạt động chính xác. File `.htaccess` trong thư mục `public` đã được cấu hình sẵn cho việc này.


6.  **Truy cập ứng dụng**
    -   Mở trình duyệt và truy cập vào địa chỉ web của bạn (ví dụ: `http://localhost:8000/benhvientaman/`).

## V. Tài khoản đăng nhập mẫu

- **Quản trị viên:**
  - **Email:** `admin`
  - **Mật khẩu:** `12341234`
- **Bác sĩ:**
  - **Email:** `ledat`
  - **Mật khẩu:** `12341234`
- **Bệnh nhân:**
  - **Tự tạo tài khoản**

## VI. License

Dự án này được cấp phép theo [Giấy phép MIT](LICENSE).