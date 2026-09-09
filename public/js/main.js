/**
 * Tất cả các script được gói trong một listener DOMContentLoaded duy nhất để tránh xung đột
 * và đảm bảo DOM đã sẵn sàng trước khi script chạy.
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM đã tải xong. Bắt đầu chạy script.");

    /**
     * Hàm kiểm tra định dạng email.
     * @param {string} email 
     * @returns {boolean}
     */
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * Hàm này khởi tạo việc xác thực (validation) cho form đăng nhập.
     */
    function initializeLoginFormValidation() {
        const loginForm = document.querySelector('form[action="/login"]');
        if (!loginForm) return; // Nếu không có form, thoát khỏi hàm.

        loginForm.addEventListener('submit', function (event) {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            let isValid = true;

            // Xóa các thông báo lỗi cũ (nếu có)
            clearErrors();

            // Kiểm tra email
            if (emailInput.value.trim() === '') {
                showError(emailInput, 'Vui lòng nhập địa chỉ email.');
                isValid = false;
            } else if (!isValidEmail(emailInput.value.trim())) {
                showError(emailInput, 'Địa chỉ email không hợp lệ.');
                isValid = false;
            }

            // Kiểm tra mật khẩu
            if (passwordInput.value.trim() === '') {
                showError(passwordInput, 'Vui lòng nhập mật khẩu.');
                isValid = false;
            }

            // Nếu form không hợp lệ, ngăn chặn việc gửi đi
            if (!isValid) {
                event.preventDefault();
            }
        });

        function showError(inputElement, message) {
            inputElement.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.innerText = message;
            inputElement.parentNode.appendChild(errorDiv);
        }

        function clearErrors() {
            const invalidInputs = loginForm.querySelectorAll('.is-invalid');
            invalidInputs.forEach(input => {
                input.classList.remove('is-invalid');
            });

            const errorMessages = loginForm.querySelectorAll('.invalid-feedback');
            errorMessages.forEach(msg => {
                msg.remove();
            });
        }
    }
    /**
     * Hàm này khởi tạo logic gửi OTP cho form đăng ký.
     */
    function initializeOtpSender() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        const sendOtpBtn = document.getElementById('sendOtpBtn');
        const emailInput = document.getElementById('Email');
        const otpMessage = document.getElementById('otp-message');

        sendOtpBtn.addEventListener('click', function () {
            const email = emailInput.value;
            if (!email || !isValidEmail(email)) {
                otpMessage.textContent = 'Vui lòng nhập một địa chỉ email hợp lệ.';
                otpMessage.className = 'form-text text-danger';
                return;
            }

            // Vô hiệu hóa nút để tránh spam
            sendOtpBtn.disabled = true;
            sendOtpBtn.textContent = 'Đang gửi...';
            otpMessage.textContent = '';

            // Gửi yêu cầu đến server bằng AJAX
            fetch('/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // Đánh dấu đây là request AJAX
                },
                body: JSON.stringify({ email: email })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        otpMessage.textContent = data.message;
                        otpMessage.className = 'form-text text-success';
                    } else {
                        otpMessage.textContent = data.message || 'Có lỗi xảy ra, vui lòng thử lại.';
                        otpMessage.className = 'form-text text-danger';
                    }
                })
                .catch(() => {
                    otpMessage.textContent = 'Lỗi kết nối. Vui lòng kiểm tra lại.';
                    otpMessage.className = 'form-text text-danger';
                })
                .finally(() => {
                    // Cho phép gửi lại sau một khoảng thời gian
                    setTimeout(() => {
                        sendOtpBtn.disabled = false;
                        sendOtpBtn.textContent = 'Gửi lại mã';
                    }, 30000); // 30 giây
                });
        });
    }

    // --- Bắt đầu khối khởi tạo ---
    initializeLoginFormValidation();
    initializeOtpSender();
    // --- Kết thúc khối khởi tạo ---
    console.log('Custom scripts loaded successfully. Bootstrap functionality should now work.');
});