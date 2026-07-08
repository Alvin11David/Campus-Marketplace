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
            helper.setSubject("Welcome to Campus Marketplace!");

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0">
                        <tr>
                            <td align="center">
                                <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
                                    <tr>
                                        <td style="background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:32px 24px;text-align:center">
                                            <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
                                                <span style="color:#ffffff;font-size:22px;font-weight:800">CM</span>
                                            </div>
                                            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700">Welcome to Campus Marketplace!</h1>
                                            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Your campus community awaits</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:32px 24px">
                                            <p style="margin:0 0 16px;font-size:15px;color:#1a1a2e">Hi <strong>%s</strong>,</p>
                                            <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.6">
                                                Thanks for joining Campus Marketplace! You're now part of a trusted
                                                community where Victoria University students buy, sell, and connect
                                                for services on campus.
                                            </p>
                                            <table cellpadding="0" cellspacing="0" style="margin:24px 0">
                                                <tr>
                                                    <td align="center">
                                                        <a href="%s"
                                                           style="display:inline-block;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">
                                                            Explore Marketplace
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0" />
                                            <div style="display:flex;gap:16px;margin:16px 0">
                                                <div style="flex:1;text-align:center;padding:12px;background:#f4f4f5;border-radius:8px">
                                                    <div style="font-size:20px;font-weight:700;color:#1E3A8A">&#x1F4E6;</div>
                                                    <p style="margin:4px 0 0;font-size:11px;color:#52525b">Find products</p>
                                                </div>
                                                <div style="flex:1;text-align:center;padding:12px;background:#f4f4f5;border-radius:8px">
                                                    <div style="font-size:20px;font-weight:700;color:#1E3A8A">&#x1F527;</div>
                                                    <p style="margin:4px 0 0;font-size:11px;color:#52525b">Book services</p>
                                                </div>
                                                <div style="flex:1;text-align:center;padding:12px;background:#f4f4f5;border-radius:8px">
                                                    <div style="font-size:20px;font-weight:700;color:#1E3A8A">&#x1F4AC;</div>
                                                    <p style="margin:4px 0 0;font-size:11px;color:#52525b">Chat & connect</p>
                                                </div>
                                            </div>
                                            <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0" />
                                            <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center">
                                                Campus Marketplace &middot; Victoria University
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(fullName, frontendUrl);

            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            // log but don't fail registration
            System.err.println("Failed to send welcome email to " + to + ": " + e.getMessage());
        }
    }
}
