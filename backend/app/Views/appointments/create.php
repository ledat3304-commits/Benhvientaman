<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-primary text-white p-4 text-center" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                    <h4 class="fw-bold mb-1"><i class="fas fa-calendar-plus me-2"></i>ĐẶT LỊCH KHÁM BỆNH</h4>
                    <p class="small text-white-50 mb-0">Bệnh viện Tâm An - Chăm sóc sức khỏe toàn diện</p>
                </div>
                <div class="card-body p-4 p-md-5">
                    <?php if (isset($_SESSION['error_message'])): ?>
                        <div class="alert alert-danger rounded-3 small mb-4">
                            <?= $_SESSION['error_message'] ?>
                            <?php unset($_SESSION['error_message']); ?>
                        </div>
                    <?php endif; ?>

                    <form action="/appointments/store" method="POST">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Chọn Bác Sĩ Khám</label>
                            <select name="BacSiID" class="form-select">
                                <option value="">-- Khám theo phân công của bệnh viện --</option>
                                <?php if (!empty($doctors) && is_array($doctors)): ?>
                                    <?php foreach ($doctors as $doc): ?>
                                        <?php 
                                            // Kiểm tra an toàn tất cả các trường tên có thể có trong CSDL
                                            $doctorName = $doc['HoTen'] ?? $doc['TenBacSi'] ?? $doc['hoten'] ?? $doc['tenbacsi'] ?? ('Bác sĩ #' . ($doc['BacSiID'] ?? ''));
                                            $specialty = $doc['ChuyenKhoa'] ?? $doc['chuyenkhoa'] ?? 'Đa khoa';
                                            $docId = $doc['BacSiID'] ?? $doc['bacsiid'] ?? '';
                                        ?>
                                        <option value="<?= htmlspecialchars($docId) ?>">
                                            Bác sĩ <?= htmlspecialchars($doctorName) ?> (<?= htmlspecialchars($specialty) ?>)
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Thời Gian Khám <span class="text-danger">*</span></label>
                            <input type="datetime-local" name="ThoiGianKham" class="form-control" required>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold">Lý Do Khám / Triệu Chứng</label>
                            <textarea name="LyDoKham" class="form-control" rows="3" placeholder="Mô tả ngắn gọn lý do khám hoặc triệu chứng của bạn..."></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 rounded-pill py-3 fw-bold text-uppercase shadow-sm">
                            <i class="fas fa-paper-plane me-2"></i> XÁC NHẬN ĐẶT LỊCH
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>