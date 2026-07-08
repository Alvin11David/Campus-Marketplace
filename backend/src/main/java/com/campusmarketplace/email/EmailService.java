package com.campusmarketplace.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String frontendUrl;

    private static final String PRIMARY = "#1E3A8A";
    private static final String PRIMARY_LIGHT = "#2563EB";
    private static final String BG = "#f4f4f5";
    private static final String TEXT = "#1a1a2e";
    private static final String MUTED = "#52525b";
    private static final String BORDER = "#e4e4e7";

    private static final String EMAIL_HEADER = """
        <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:%s;padding:0">
            <tr><td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.06)">
                    <tr>
                        <td style="background:linear-gradient(135deg,%s,%s);padding:36px 32px 24px;text-align:center">
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px">
                                <tr>
                                    <td style="width:56px;height:56px;background:rgba(255,255,255,0.12);border-radius:14px;text-align:center;vertical-align:middle">
                                        <span style="color:#ffffff;font-size:24px;font-weight:800;line-height:56px">CM</span>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="color:#ffffff;margin:0 0 6px;font-size:24px;font-weight:700;letter-spacing:-0.3px">%s</h1>
                            <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;line-height:1.5">%s</p>
                        </td>
                    </tr>
                    <tr><td style="padding:32px 32px 24px">
        """;

    private static final String EMAIL_FOOTER = """
                    </td></tr>
                    <tr><td style="padding:0 32px 24px">
                        <hr style="border:none;border-top:1px solid %s;margin:0" />
                        <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6">
                            Campus Marketplace &middot; Victoria University<br>
                            <span style="font-size:11px">This is an automated message. Please do not reply.</span>
                        </p>
                    </td></tr>
                </table>
            </td></tr>
        </table>
        """;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.frontend.url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
    }

    @Async
    public void sendWelcomeEmail(String to, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Welcome to Campus Marketplace, " + fullName + "!");

            String html = buildWelcomeHtml(fullName);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send welcome email to " + to + ": " + e.getMessage());
        }
    }

    @Async
    public void sendOtpEmail(String to, String fullName, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Your password reset code");

            String html = buildOtpHtml(fullName, otp);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send OTP email to " + to + ": " + e.getMessage());
        }
    }

    private String buildWelcomeHtml(String name) {
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background-color:%s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;color:%s">
                %s
                <p style="margin:0 0 16px;font-size:15px;color:%s">Hi <strong style="color:%s">%s</strong>,</p>
                <p style="margin:0 0 12px;font-size:14px;color:%s;line-height:1.7">
                    Welcome to <strong style="color:%s">Campus Marketplace</strong>! You're now part of a trusted community where Victoria University students buy, sell, and connect for campus services.
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:%s;line-height:1.7">
                    Start exploring listings, connect with service providers, and make the most of campus life.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                    <tr>
                        <td align="center">
                            <a href="%s"
                               style="display:inline-block;background:linear-gradient(135deg,%s,%s);color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:600;box-shadow:0 4px 14px rgba(30,58,138,0.25)">
                                Browse Marketplace
                            </a>
                        </td>
                    </tr>
                </table>
                <hr style="border:none;border-top:1px solid %s;margin:0 0 24px" />
                <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td width="33%%" style="padding:16px 8px;text-align:center;vertical-align:top">
                            <div style="font-size:22px;margin-bottom:4px">🛍️</div>
                            <p style="margin:0;font-size:12px;color:%s;font-weight:600">Shop Products</p>
                            <p style="margin:2px 0 0;font-size:11px;color:%s">Textbooks, gadgets &amp; more</p>
                        </td>
                        <td width="33%%" style="padding:16px 8px;text-align:center;vertical-align:top">
                            <div style="font-size:22px;margin-bottom:4px">🔧</div>
                            <p style="margin:0;font-size:12px;color:%s;font-weight:600">Hire Services</p>
                            <p style="margin:2px 0 0;font-size:11px;color:%s">Repairs, tutoring &amp; beauty</p>
                        </td>
                        <td width="33%%" style="padding:16px 8px;text-align:center;vertical-align:top">
                            <div style="font-size:22px;margin-bottom:4px">💬</div>
                            <p style="margin:0;font-size:12px;color:%s;font-weight:600">Chat Instantly</p>
                            <p style="margin:2px 0 0;font-size:11px;color:%s">In-app messaging</p>
                        </td>
                    </tr>
                </table>
                %s
            </body></html>
            """.formatted(
                BG, TEXT,
                EMAIL_HEADER.formatted(BG, PRIMARY, PRIMARY_LIGHT,
                    "Welcome aboard! \uD83C\uDF89",
                    "Your campus community awaits"),
                TEXT, PRIMARY, name,
                MUTED, PRIMARY,
                MUTED,
                frontendUrl, PRIMARY, PRIMARY_LIGHT,
                BORDER,
                TEXT, MUTED,
                TEXT, MUTED,
                TEXT, MUTED,
                EMAIL_FOOTER.formatted(BORDER)
            );
    }

    private String buildOtpHtml(String name, String otp) {
        String otpDisplay = otp.substring(0, 3) + " " + otp.substring(3);

        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background-color:%s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;color:%s">
                %s
                <p style="margin:0 0 16px;font-size:15px;color:%s">Hi <strong style="color:%s">%s</strong>,</p>
                <p style="margin:0 0 20px;font-size:14px;color:%s;line-height:1.7">
                    We received a request to reset your Campus Marketplace password. Use the code below to reset it. This code expires in <strong style="color:%s">15 minutes</strong>.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin:0 0 24px" align="center">
                    <tr>
                        <td style="background:%s;border-radius:12px;padding:18px 40px;text-align:center;font-size:32px;font-weight:800;letter-spacing:10px;color:%s;font-family:'Courier New',monospace;border:1px solid rgba(30,58,138,0.15)">
                            %s
                        </td>
                    </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;color:%s;line-height:1.6">
                    If you didn't request this, you can safely ignore this email. Your password won't change unless you use the code above.
                </p>
                <hr style="border:none;border-top:1px solid %s;margin:24px 0" />
                <table cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="background:%s;border-radius:6px;padding:10px 14px">
                            <p style="margin:0;font-size:12px;color:%s;line-height:1.5">
                                ⚠️ Never share this code with anyone. Campus Marketplace will never ask for your code or password.
                            </p>
                        </td>
                    </tr>
                </table>
                %s
            </body></html>
            """.formatted(
                BG, TEXT,
                EMAIL_HEADER.formatted(BG, PRIMARY, PRIMARY_LIGHT,
                    "Reset your password",
                    "Enter the code below to continue"),
                TEXT, PRIMARY, name,
                MUTED, PRIMARY,
                "#f8f4ff", PRIMARY, otpDisplay,
                MUTED,
                BORDER,
                "#fef2f2", "#991b1b",
                EMAIL_FOOTER.formatted(BORDER)
            );
    }
}
