-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3307
-- Thời gian đã tạo: Th9 07, 2026 lúc 01:37 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `benhvientaman`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `auth_tokens`
--

CREATE TABLE `auth_tokens` (
  `TokenID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Selector` varchar(255) NOT NULL,
  `ValidatorHash` varchar(255) NOT NULL,
  `ExpiresAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bacsi`
--

CREATE TABLE `bacsi` (
  `BacSiID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `ChuyenKhoaID` int(11) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `KinhNghiem` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bacsi`
--

INSERT INTO `bacsi` (`BacSiID`, `UserID`, `ChuyenKhoaID`, `MoTa`, `KinhNghiem`) VALUES
(1, 2, 5, '', '10 năm kinh nghiệm trong lĩnh vực Tim mạch'),
(2, 1, 27, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `benhnhan`
--

CREATE TABLE `benhnhan` (
  `BenhNhanID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `HoTen` varchar(100) NOT NULL,
  `NgaySinh` date DEFAULT NULL,
  `GioiTinh` enum('Nam','Nữ','Khác') DEFAULT NULL,
  `SoDienThoai` varchar(15) NOT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `NgayTaoHoSo` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `benhnhan`
--

INSERT INTO `benhnhan` (`BenhNhanID`, `UserID`, `HoTen`, `NgaySinh`, `GioiTinh`, `SoDienThoai`, `DiaChi`, `NgayTaoHoSo`) VALUES
(1, 2, 'Trương Công Ước', NULL, NULL, '0333876785', NULL, '2025-07-05 11:31:09'),
(2, 4, 'benh nhan', '1999-07-22', 'Nữ', '0123456789', 'Giáp Bát, Hà Nội', '2025-07-05 12:13:58'),
(3, 5, 'Admin', NULL, NULL, '0346861035', NULL, '2025-07-06 14:04:13'),
(4, 6, 'Nguyễn Văn A', '2008-06-04', 'Nam', '0346861036', NULL, '2025-07-06 17:37:39'),
(5, NULL, 'Nguyễn Thị A', '2006-11-23', 'Nữ', '0346861037', NULL, '2025-07-06 21:09:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdichvukham`
--

CREATE TABLE `chitietdichvukham` (
  `ChiTietID` int(11) NOT NULL,
  `LichKhamID` int(11) NOT NULL,
  `DichVuID` int(11) NOT NULL,
  `SoLuong` int(11) NOT NULL DEFAULT 1,
  `DonGiaTaiThoiDiem` decimal(15,2) NOT NULL,
  `GhiChu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chuyenkhoa`
--

CREATE TABLE `chuyenkhoa` (
  `ChuyenKhoaID` int(11) NOT NULL,
  `TenChuyenKhoa` varchar(100) NOT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chuyenkhoa`
--

INSERT INTO `chuyenkhoa` (`ChuyenKhoaID`, `TenChuyenKhoa`, `MoTa`) VALUES
(1, 'Nội tổng quát', 'Chẩn đoán và điều trị các bệnh nội khoa tổng quát.'),
(2, 'Ngoại tổng quát', 'Phẫu thuật điều trị các bệnh ngoại khoa phổ biến.'),
(3, 'Nhi khoa', 'Khám và điều trị bệnh lý trẻ em.'),
(4, 'Sản phụ khoa', 'Chăm sóc sức khỏe phụ nữ, thai sản.'),
(5, 'Tim mạch', 'Chẩn đoán và điều trị các bệnh tim mạch.'),
(6, 'Da liễu', 'Điều trị các bệnh về da và thẩm mỹ da.'),
(7, 'Tai Mũi Họng', 'Khám và điều trị các bệnh tai, mũi, họng.'),
(8, 'Răng Hàm Mặt', 'Chăm sóc răng miệng và phẫu thuật hàm mặt.'),
(9, 'Mắt', 'Khám và điều trị các bệnh về mắt.'),
(10, 'Thần kinh', 'Khám và điều trị các bệnh lý thần kinh.'),
(11, 'Ung bướu', 'Chẩn đoán và điều trị ung thư, khối u.'),
(12, 'Hô hấp', 'Khám và điều trị bệnh lý phổi và hô hấp.'),
(13, 'Tiêu hóa', 'Khám và điều trị bệnh dạ dày, ruột và gan.'),
(14, 'Thận - Tiết niệu', 'Điều trị bệnh thận và đường tiết niệu.'),
(15, 'Nội tiết', 'Chẩn đoán và điều trị bệnh lý nội tiết như tiểu đường.'),
(16, 'Chấn thương chỉnh hình', 'Phẫu thuật và điều trị xương khớp, chấn thương.'),
(17, 'Phục hồi chức năng', 'Hỗ trợ hồi phục chức năng vận động.'),
(18, 'Huyết học', 'Chẩn đoán và điều trị bệnh máu.'),
(19, 'Dinh dưỡng', 'Tư vấn chế độ ăn và dinh dưỡng.'),
(20, 'Nội soi', 'Dịch vụ nội soi tiêu hóa và hô hấp.'),
(21, 'Lão khoa', 'Khám và chăm sóc sức khỏe người cao tuổi.'),
(22, 'Tâm thần', 'Chẩn đoán và điều trị rối loạn tâm thần.'),
(23, 'Miễn dịch - Dị ứng', 'Chẩn đoán và điều trị dị ứng và rối loạn miễn dịch.'),
(24, 'Phong - Da liễu', 'Điều trị bệnh da liễu và bệnh phong.'),
(25, 'Hồi sức cấp cứu', 'Cấp cứu và chăm sóc bệnh nhân nặng.'),
(26, 'Gây mê hồi sức', 'Hỗ trợ gây mê và hồi tỉnh sau phẫu thuật.'),
(27, 'Chẩn đoán hình ảnh', 'Chụp X-quang, MRI, CT.'),
(28, 'Xét nghiệm y học', 'Phòng xét nghiệm y học lâm sàng.'),
(29, 'Y học cổ truyền', 'Điều trị bằng thuốc Nam, châm cứu.'),
(30, 'Sức khỏe sinh sản', 'Tư vấn và chăm sóc sức khỏe sinh sản.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmucdichvu`
--

CREATE TABLE `danhmucdichvu` (
  `DichVuID` int(11) NOT NULL,
  `TenDichVu` varchar(255) NOT NULL,
  `MoTa` text DEFAULT NULL,
  `DonGia` decimal(15,2) NOT NULL DEFAULT 0.00,
  `HoatDong` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhmucthuoc`
--

CREATE TABLE `danhmucthuoc` (
  `ThuocID` int(11) NOT NULL,
  `TenThuoc` varchar(255) NOT NULL,
  `HoatChat` varchar(255) DEFAULT NULL,
  `DonViTinh` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `danhmucthuoc`
--

INSERT INTO `danhmucthuoc` (`ThuocID`, `TenThuoc`, `HoatChat`, `DonViTinh`) VALUES
(1, 'Paracetamol 500mg', 'Paracetamol', 'Viên'),
(2, 'Amoxicillin 500mg', 'Amoxicillin', 'Viên'),
(3, 'Ibuprofen 400mg', 'Ibuprofen', 'Viên'),
(4, 'Cefixime 100mg', 'Cefixime', 'Viên'),
(5, 'Vitamin C 500mg', 'Acid Ascorbic', 'Viên'),
(6, 'Clorpheniramin 4mg', 'Chlorpheniramine', 'Viên'),
(7, 'Omeprazole 20mg', 'Omeprazole', 'Viên'),
(8, 'Metformin 500mg', 'Metformin', 'Viên'),
(9, 'Amlodipine 5mg', 'Amlodipine', 'Viên'),
(10, 'Losartan 50mg', 'Losartan', 'Viên'),
(11, 'Furosemide 40mg', 'Furosemide', 'Viên'),
(12, 'Enalapril 10mg', 'Enalapril', 'Viên'),
(13, 'Simvastatin 20mg', 'Simvastatin', 'Viên'),
(14, 'Atorvastatin 10mg', 'Atorvastatin', 'Viên'),
(15, 'Prednisolone 5mg', 'Prednisolone', 'Viên'),
(16, 'Dexamethasone 0.5mg', 'Dexamethasone', 'Viên'),
(17, 'Azithromycin 250mg', 'Azithromycin', 'Viên'),
(18, 'Ciprofloxacin 500mg', 'Ciprofloxacin', 'Viên'),
(19, 'Clindamycin 300mg', 'Clindamycin', 'Viên'),
(20, 'Loperamide 2mg', 'Loperamide', 'Viên'),
(21, 'Salbutamol 2mg', 'Salbutamol', 'Viên'),
(22, 'Cetirizine 10mg', 'Cetirizine', 'Viên'),
(23, 'Loratadine 10mg', 'Loratadine', 'Viên'),
(24, 'Ranitidine 150mg', 'Ranitidine', 'Viên'),
(25, 'Pantoprazole 40mg', 'Pantoprazole', 'Viên'),
(26, 'Esomeprazole 20mg', 'Esomeprazole', 'Viên'),
(27, 'Alprazolam 0.5mg', 'Alprazolam', 'Viên'),
(28, 'Diazepam 5mg', 'Diazepam', 'Viên'),
(29, 'Domperidone 10mg', 'Domperidone', 'Viên'),
(30, 'Spiramycin 3MIU', 'Spiramycin', 'Viên'),
(31, 'Rifampicin 300mg', 'Rifampicin', 'Viên'),
(32, 'Isoniazid 300mg', 'Isoniazid', 'Viên'),
(33, 'Pyrazinamide 500mg', 'Pyrazinamide', 'Viên'),
(34, 'Ethambutol 400mg', 'Ethambutol', 'Viên'),
(35, 'Methotrexate 2.5mg', 'Methotrexate', 'Viên'),
(36, 'Allopurinol 100mg', 'Allopurinol', 'Viên'),
(37, 'Colchicine 0.5mg', 'Colchicine', 'Viên'),
(38, 'Levothyroxine 50mcg', 'Levothyroxine', 'Viên'),
(39, 'Carbimazole 5mg', 'Carbimazole', 'Viên'),
(40, 'Glimepiride 2mg', 'Glimepiride', 'Viên'),
(41, 'Gliclazide 30mg', 'Gliclazide', 'Viên'),
(42, 'Pioglitazone 15mg', 'Pioglitazone', 'Viên'),
(43, 'Sitagliptin 50mg', 'Sitagliptin', 'Viên'),
(44, 'Linagliptin 5mg', 'Linagliptin', 'Viên'),
(45, 'Bisoprolol 5mg', 'Bisoprolol', 'Viên'),
(46, 'Metoprolol 50mg', 'Metoprolol', 'Viên'),
(47, 'Propranolol 40mg', 'Propranolol', 'Viên'),
(48, 'Verapamil 80mg', 'Verapamil', 'Viên'),
(49, 'Diltiazem 60mg', 'Diltiazem', 'Viên'),
(50, 'Nitroglycerin 2.6mg', 'Nitroglycerin', 'Viên'),
(51, 'Warfarin 2mg', 'Warfarin', 'Viên'),
(52, 'Aspirin 81mg', 'Acetylsalicylic Acid', 'Viên'),
(53, 'Clopidogrel 75mg', 'Clopidogrel', 'Viên'),
(54, 'Dabigatran 110mg', 'Dabigatran', 'Viên'),
(55, 'Rivaroxaban 10mg', 'Rivaroxaban', 'Viên'),
(56, 'Apixaban 5mg', 'Apixaban', 'Viên'),
(57, 'Rosuvastatin 10mg', 'Rosuvastatin', 'Viên'),
(58, 'Hydrochlorothiazide 25mg', 'Hydrochlorothiazide', 'Viên'),
(59, 'Spironolactone 25mg', 'Spironolactone', 'Viên'),
(60, 'Indapamide 1.5mg', 'Indapamide', 'Viên'),
(61, 'Telmisartan 40mg', 'Telmisartan', 'Viên'),
(62, 'Valsartan 80mg', 'Valsartan', 'Viên'),
(63, 'Olmesartan 20mg', 'Olmesartan', 'Viên'),
(64, 'Ramipril 5mg', 'Ramipril', 'Viên'),
(65, 'Perindopril 4mg', 'Perindopril', 'Viên'),
(66, 'Candesartan 8mg', 'Candesartan', 'Viên'),
(67, 'Irbesartan 150mg', 'Irbesartan', 'Viên'),
(68, 'Trimetazidine 20mg', 'Trimetazidine', 'Viên'),
(69, 'Ivabradine 5mg', 'Ivabradine', 'Viên'),
(70, 'Digoxin 0.25mg', 'Digoxin', 'Viên'),
(71, 'Folic Acid 5mg', 'Folic Acid', 'Viên'),
(72, 'Ferrous Sulfate 200mg', 'Ferrous Sulfate', 'Viên'),
(73, 'Cyanocobalamin 500mcg', 'Vitamin B12', 'Viên'),
(74, 'Thiamine 100mg', 'Vitamin B1', 'Viên'),
(75, 'Pyridoxine 50mg', 'Vitamin B6', 'Viên'),
(76, 'Calcium Carbonate 500mg', 'Calcium Carbonate', 'Viên'),
(77, 'Cholecalciferol 1000IU', 'Vitamin D3', 'Viên'),
(78, 'Magnesium Oxide 250mg', 'Magnesium Oxide', 'Viên'),
(79, 'Zinc Sulfate 50mg', 'Zinc Sulfate', 'Viên'),
(80, 'Ascorbic Acid 500mg', 'Vitamin C', 'Viên'),
(81, 'Alpha Tocopherol 400IU', 'Vitamin E', 'Viên'),
(82, 'Riboflavin 10mg', 'Vitamin B2', 'Viên'),
(83, 'Nicotinamide 100mg', 'Vitamin B3', 'Viên'),
(84, 'Biotin 500mcg', 'Biotin', 'Viên'),
(85, 'Pantothenic Acid 100mg', 'Vitamin B5', 'Viên'),
(86, 'Levocetirizine 5mg', 'Levocetirizine', 'Viên'),
(87, 'Montelukast 10mg', 'Montelukast', 'Viên'),
(88, 'Ketotifen 1mg', 'Ketotifen', 'Viên'),
(89, 'Mebendazole 500mg', 'Mebendazole', 'Viên'),
(90, 'Albendazole 400mg', 'Albendazole', 'Viên'),
(91, 'Doxycycline 100mg', 'Doxycycline', 'Viên'),
(92, 'Minocycline 100mg', 'Minocycline', 'Viên'),
(93, 'Erythromycin 250mg', 'Erythromycin', 'Viên'),
(94, 'Levofloxacin 500mg', 'Levofloxacin', 'Viên'),
(95, 'Moxifloxacin 400mg', 'Moxifloxacin', 'Viên'),
(96, 'Linezolid 600mg', 'Linezolid', 'Viên'),
(97, 'Vancomycin 500mg', 'Vancomycin', 'Viên'),
(98, 'Meropenem 500mg', 'Meropenem', 'Viên'),
(99, 'Imipenem 500mg', 'Imipenem', 'Viên'),
(100, 'Ceftriaxone 1g', 'Ceftriaxone', 'Viên');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donthuoc`
--

CREATE TABLE `donthuoc` (
  `DonThuocID` int(11) NOT NULL,
  `LichKhamID` int(11) NOT NULL,
  `ThuocID` int(11) NOT NULL,
  `SoLuong` int(11) NOT NULL,
  `HuongDanSuDung` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `donthuoc`
--

INSERT INTO `donthuoc` (`DonThuocID`, `LichKhamID`, `ThuocID`, `SoLuong`, `HuongDanSuDung`) VALUES
(1, 5, 48, 5, 'uống sau ăn sáng'),
(2, 5, 52, 20, 'uống sau ăn trưa'),
(3, 5, 84, 10, 'uống sau ăn tối'),
(4, 4, 76, 100, ''),
(5, 1, 17, 50, ''),
(6, 3, 17, 50, '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichkham`
--

CREATE TABLE `lichkham` (
  `LichKhamID` int(11) NOT NULL,
  `BacSiID` int(11) NOT NULL,
  `BenhNhanID` int(11) NOT NULL,
  `ThoiGianKham` datetime NOT NULL,
  `TrangThai` enum('ChoXacNhan','DaXacNhan','DaHoanThanh','DaHuy') NOT NULL DEFAULT 'ChoXacNhan',
  `LyDoKham` text DEFAULT NULL,
  `GhiChuCuaBacSi` text DEFAULT NULL,
  `NgayDatLich` datetime DEFAULT current_timestamp(),
  `TrieuChung` text DEFAULT NULL,
  `ChuanDoan` text DEFAULT NULL,
  `PhacDoDieuTri` text DEFAULT NULL,
  `LoiDanKeDon` text DEFAULT NULL,
  `NgayTaiKham` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lichkham`
--

INSERT INTO `lichkham` (`LichKhamID`, `BacSiID`, `BenhNhanID`, `ThoiGianKham`, `TrangThai`, `LyDoKham`, `GhiChuCuaBacSi`, `NgayDatLich`, `TrieuChung`, `ChuanDoan`, `PhacDoDieuTri`, `LoiDanKeDon`, `NgayTaiKham`) VALUES
(1, 1, 2, '2025-07-06 08:00:00', 'DaHoanThanh', 'Khám tổng quát', '', '2025-07-05 22:15:30', 'Mệt mỏi nhẹ', 'Bình thường', '', NULL, '2025-07-24'),
(2, 1, 2, '2025-07-07 09:30:00', 'ChoXacNhan', 'Khám tim mạch', NULL, '2025-07-05 22:15:30', 'Đau ngực, hồi hộp', NULL, NULL, NULL, NULL),
(3, 1, 2, '2025-07-08 14:00:00', 'DaHoanThanh', 'Khám da liễu', '', '2025-07-05 22:15:30', 'Nổi mẩn đỏ', 'Bình thường\r\n', '', NULL, NULL),
(4, 1, 2, '2025-07-09 10:15:00', 'DaHoanThanh', 'Khám tiêu hóa', '', '2025-07-05 22:15:30', 'Đau bụng âm ỉ', 'Bình thường', '', NULL, '2025-07-10'),
(5, 1, 2, '2025-07-10 16:00:00', 'DaHoanThanh', 'Khám mắt', 'Không bỏ lượt uống', '2025-07-05 22:15:30', 'Nhìn mờ, chảy nước mắt', '', '', NULL, '2025-07-31'),
(6, 1, 2, '2025-07-07 15:00:00', 'ChoXacNhan', 'Kiểm tra tổng quát', NULL, '2025-07-06 12:55:34', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichlamviec`
--

CREATE TABLE `lichlamviec` (
  `LichLamViecID` int(11) NOT NULL,
  `BacSiID` int(11) NOT NULL,
  `NgayTrongTuan` int(11) NOT NULL COMMENT '0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy',
  `GioBatDau` time NOT NULL,
  `GioKetThuc` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lichlamviec`
--

INSERT INTO `lichlamviec` (`LichLamViecID`, `BacSiID`, `NgayTrongTuan`, `GioBatDau`, `GioKetThuc`) VALUES
(0, 1, 1, '07:00:00', '17:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `UserID` int(11) NOT NULL,
  `HoTen` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `SoDienThoai` varchar(15) DEFAULT NULL,
  `VaiTro` enum('BacSi','BenhNhan','QuanTri') NOT NULL DEFAULT 'BenhNhan',
  `NgayTao` datetime DEFAULT current_timestamp(),
  `HoatDong` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoidung`
--

INSERT INTO `nguoidung` (`UserID`, `HoTen`, `Email`, `MatKhau`, `SoDienThoai`, `VaiTro`, `NgayTao`, `HoatDong`) VALUES
(1, 'taman', 'taman@gmail.com', '12341234', '0346861038', 'BacSi', '2025-07-05 10:28:12', 1),
(2, 'Lê Đạt', 'ledat3@gmail.com', '12341234', '0333876785', 'BacSi', '2025-07-05 11:31:09', 1),
(4, 'benh nhan', 'benhnhan1@gmail.com', '12341234', '0123456789', 'BenhNhan', '2025-07-05 12:13:58', 1),
(5, 'Admin', 'admin@gmail.com', '$2y$10$uRsri5JFN.f2Z2zRrouLqeXFTTEsAlyQgqdTGuqmSuyutfWBmQvX2', '0346861035', 'QuanTri', '2025-07-06 14:04:13', 1),
(6, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '12341234', '0346861036', 'BenhNhan', '2025-07-06 17:37:39', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thongtinsuckhoe`
--

CREATE TABLE `thongtinsuckhoe` (
  `ThongTinID` int(11) NOT NULL,
  `BenhNhanID` int(11) NOT NULL,
  `Loai` enum('Tiền sử bệnh','Dị ứng','Phẫu thuật') NOT NULL,
  `MoTa` varchar(255) NOT NULL,
  `GhiChu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `thongtinsuckhoe`
--

INSERT INTO `thongtinsuckhoe` (`ThongTinID`, `BenhNhanID`, `Loai`, `MoTa`, `GhiChu`) VALUES
(1, 2, 'Tiền sử bệnh', 'Dị ứng với penicillin, Đã phẫu thuật ruột thừ năm 2010', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`TokenID`),
  ADD UNIQUE KEY `Selector` (`Selector`),
  ADD KEY `fk_authtokens_user_idx` (`UserID`);

--
-- Chỉ mục cho bảng `bacsi`
--
ALTER TABLE `bacsi`
  ADD PRIMARY KEY (`BacSiID`),
  ADD UNIQUE KEY `UserID` (`UserID`),
  ADD KEY `ChuyenKhoaID` (`ChuyenKhoaID`);

--
-- Chỉ mục cho bảng `benhnhan`
--
ALTER TABLE `benhnhan`
  ADD PRIMARY KEY (`BenhNhanID`),
  ADD UNIQUE KEY `UserID` (`UserID`),
  ADD KEY `idx_benhnhan_sdt` (`SoDienThoai`);

--
-- Chỉ mục cho bảng `chitietdichvukham`
--
ALTER TABLE `chitietdichvukham`
  ADD PRIMARY KEY (`ChiTietID`),
  ADD KEY `fk_chitietdv_lichkham_idx` (`LichKhamID`),
  ADD KEY `fk_chitietdv_danhmuc_idx` (`DichVuID`);

--
-- Chỉ mục cho bảng `chuyenkhoa`
--
ALTER TABLE `chuyenkhoa`
  ADD PRIMARY KEY (`ChuyenKhoaID`),
  ADD UNIQUE KEY `TenChuyenKhoa` (`TenChuyenKhoa`);

--
-- Chỉ mục cho bảng `danhmucdichvu`
--
ALTER TABLE `danhmucdichvu`
  ADD PRIMARY KEY (`DichVuID`),
  ADD UNIQUE KEY `TenDichVu_UNIQUE` (`TenDichVu`);

--
-- Chỉ mục cho bảng `danhmucthuoc`
--
ALTER TABLE `danhmucthuoc`
  ADD PRIMARY KEY (`ThuocID`),
  ADD UNIQUE KEY `TenThuoc_UNIQUE` (`TenThuoc`);

--
-- Chỉ mục cho bảng `donthuoc`
--
ALTER TABLE `donthuoc`
  ADD PRIMARY KEY (`DonThuocID`),
  ADD KEY `fk_donthuoc_lichkham_idx` (`LichKhamID`),
  ADD KEY `fk_donthuoc_danhmuc_idx` (`ThuocID`);

--
-- Chỉ mục cho bảng `lichkham`
--
ALTER TABLE `lichkham`
  ADD PRIMARY KEY (`LichKhamID`),
  ADD KEY `idx_lichkham_bacsi_thoigian` (`BacSiID`,`ThoiGianKham`),
  ADD KEY `idx_lichkham_benhnhan_thoigian` (`BenhNhanID`,`ThoiGianKham`);

--
-- Chỉ mục cho bảng `lichlamviec`
--
ALTER TABLE `lichlamviec`
  ADD UNIQUE KEY `unique_schedule` (`BacSiID`,`NgayTrongTuan`,`GioBatDau`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `SoDienThoai` (`SoDienThoai`);

--
-- Chỉ mục cho bảng `thongtinsuckhoe`
--
ALTER TABLE `thongtinsuckhoe`
  ADD PRIMARY KEY (`ThongTinID`),
  ADD KEY `BenhNhanID` (`BenhNhanID`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `auth_tokens`
--
ALTER TABLE `auth_tokens`
  MODIFY `TokenID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `bacsi`
--
ALTER TABLE `bacsi`
  MODIFY `BacSiID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `benhnhan`
--
ALTER TABLE `benhnhan`
  MODIFY `BenhNhanID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `chitietdichvukham`
--
ALTER TABLE `chitietdichvukham`
  MODIFY `ChiTietID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chuyenkhoa`
--
ALTER TABLE `chuyenkhoa`
  MODIFY `ChuyenKhoaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT cho bảng `danhmucdichvu`
--
ALTER TABLE `danhmucdichvu`
  MODIFY `DichVuID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danhmucthuoc`
--
ALTER TABLE `danhmucthuoc`
  MODIFY `ThuocID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT cho bảng `donthuoc`
--
ALTER TABLE `donthuoc`
  MODIFY `DonThuocID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `lichkham`
--
ALTER TABLE `lichkham`
  MODIFY `LichKhamID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `thongtinsuckhoe`
--
ALTER TABLE `thongtinsuckhoe`
  MODIFY `ThongTinID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `fk_authtokens_user` FOREIGN KEY (`UserID`) REFERENCES `nguoidung` (`UserID`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `bacsi`
--
ALTER TABLE `bacsi`
  ADD CONSTRAINT `bacsi_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `nguoidung` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `bacsi_ibfk_2` FOREIGN KEY (`ChuyenKhoaID`) REFERENCES `chuyenkhoa` (`ChuyenKhoaID`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `benhnhan`
--
ALTER TABLE `benhnhan`
  ADD CONSTRAINT `benhnhan_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `nguoidung` (`UserID`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `chitietdichvukham`
--
ALTER TABLE `chitietdichvukham`
  ADD CONSTRAINT `fk_chitietdv_danhmuc` FOREIGN KEY (`DichVuID`) REFERENCES `danhmucdichvu` (`DichVuID`),
  ADD CONSTRAINT `fk_chitietdv_lichkham` FOREIGN KEY (`LichKhamID`) REFERENCES `lichkham` (`LichKhamID`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `donthuoc`
--
ALTER TABLE `donthuoc`
  ADD CONSTRAINT `fk_donthuoc_danhmuc` FOREIGN KEY (`ThuocID`) REFERENCES `danhmucthuoc` (`ThuocID`) ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_donthuoc_lichkham` FOREIGN KEY (`LichKhamID`) REFERENCES `lichkham` (`LichKhamID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Các ràng buộc cho bảng `lichkham`
--
ALTER TABLE `lichkham`
  ADD CONSTRAINT `lichkham_ibfk_1` FOREIGN KEY (`BacSiID`) REFERENCES `bacsi` (`BacSiID`) ON DELETE CASCADE,
  ADD CONSTRAINT `lichkham_ibfk_2` FOREIGN KEY (`BenhNhanID`) REFERENCES `benhnhan` (`BenhNhanID`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `thongtinsuckhoe`
--
ALTER TABLE `thongtinsuckhoe`
  ADD CONSTRAINT `thongtinsuckhoe_ibfk_1` FOREIGN KEY (`BenhNhanID`) REFERENCES `benhnhan` (`BenhNhanID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
