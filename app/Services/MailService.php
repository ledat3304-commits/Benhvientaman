<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class MailService
{
    protected PHPMailer $mailer;
    protected array $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/mail.php';
        $this->mailer = new PHPMailer(true);
        $this->configure();
    }

    private function configure(): void
    {
        // Server settings
        $this->mailer->isSMTP();
        $this->mailer->Host       = $this->config['host'];
        $this->mailer->SMTPAuth   = $this->config['smtp_auth'];
        $this->mailer->Username   = $this->config['username'];
        $this->mailer->Password   = $this->config['password'];
        $this->mailer->SMTPSecure = $this->config['smtp_secure'];
        $this->mailer->Port       = $this->config['port'];
        $this->mailer->CharSet    = 'UTF-8';
    }

    /**
     * Gửi email OTP.
     * @param string $toEmail Địa chỉ email người nhận.
     * @param string $otp Mã OTP.
     * @return bool
     */
    public function sendOtp(string $toEmail, string $otp): bool
    {
        try {
            // Recipients
            $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);
            $this->mailer->addAddress($toEmail);

            // Content
            $this->mailer->isHTML(true);
            $this->mailer->Subject = '🔐 Xác thực tài khoản của bạn tại Bệnh viện Tâm An';

            $otp = htmlspecialchars($otp, ENT_QUOTES, 'UTF-8');

            $this->mailer->Body = <<<HTML
            <html>
              <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                  <div style="background-color: #2d89ef; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Bệnh viện Tâm An</h1>
                    <p style="margin: 5px 0 0; font-size: 16px;">Nơi sức khỏe của bạn là ưu tiên hàng đầu</p>
                  </div>
                  <div style="padding: 30px;">
                    <p style="font-size: 16px;">Xin chào,</p>
                    <p style="font-size: 16px;">
                      Cảm ơn bạn đã lựa chọn <strong>Bệnh viện Tâm An</strong>. Chúng tôi rất hân hạnh được đồng hành cùng bạn trên hành trình chăm sóc sức khỏe.
                    </p>
                    <p style="font-size: 16px;">Để hoàn tất đăng ký, vui lòng sử dụng mã xác thực (OTP) bên dưới:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <span style="display: inline-block; padding: 16px 32px; background-color: #2d89ef; color: white; font-size: 22px; font-weight: bold; letter-spacing: 2px; border-radius: 6px;">
                        {$otp}
                      </span>
                    </div>
                    <p style="font-size: 16px; color: #555;">
                      ⏳ Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai vì lý do bảo mật.
                    </p>
                    <p style="font-size: 16px;">Nếu bạn không yêu cầu tạo tài khoản, hãy bỏ qua email này.</p>
                    <br>
                    <p style="font-size: 16px;">Trân trọng,</p>
                    <p style="font-size: 16px;"><strong>Đội ngũ Bệnh viện Tâm An</strong></p>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 13px; color: #999; text-align: center;">
                      Email này được gửi tự động. Vui lòng không trả lời trực tiếp. Nếu cần hỗ trợ, hãy liên hệ qua website hoặc hotline.
                    </p>
                  </div>
                </div>
              </body>
            </html>
            HTML;

            $this->mailer->AltBody = <<<TEXT
            Bệnh viện Tâm An

            Xin chào,

            Cảm ơn bạn đã lựa chọn Bệnh viện Tâm Ani.
            Mã xác thực (OTP) của bạn là: {$otp}

            Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.

            Nếu bạn không yêu cầu tạo tài khoản, hãy bỏ qua email này.

            Trân trọng,
            Đội ngũ Bệnh viện Tâm An
            TEXT;

            $this->mailer->send();
            return true;
        } catch (Exception $e) {
            error_log("Mailer Error: {$this->mailer->ErrorInfo}");
            return false;
        }
    }
}