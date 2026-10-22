import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email dan kode verifikasi diperlukan." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const authorizedEmail = "rizxstudioproject@gmail.com";

    if (cleanEmail !== authorizedEmail) {
      return NextResponse.json(
        { error: "Email tidak terdaftar sebagai email recovery admin." },
        { status: 403 }
      );
    }

    // Attempt to send email if SMTP / Gmail configuration is provided
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "rizxstudioproject@gmail.com";
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    let emailDelivered = false;
    let deliveryMessage = "";

    if (smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Rizx Studio Security" <${smtpUser}>`,
          to: authorizedEmail,
          subject: "Kode Verifikasi Reset Password Admin — Rizx Studio",
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0b0c10; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 500px; margin: auto;">
              <h2 style="color: #14AF9E; margin-bottom: 8px;">Rizx Studio Admin Security</h2>
              <p style="color: #a0a0a0; font-size: 14px;">Permintaan reset password akun Admin diterima.</p>
              
              <div style="background-color: #16181f; border: 1px solid rgba(20, 175, 158, 0.4); border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
                <span style="font-size: 11px; color: #14AF9E; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 8px;">KODE VERIFIKASI ANDA</span>
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: monospace;">${code}</span>
              </div>

              <p style="color: #a0a0a0; font-size: 13px; line-height: 1.6;">
                Masukkan kode 6 digit di atas pada form verifikasi di website. Kode ini berlaku selama 10 menit.
              </p>
              <p style="color: #666666; font-size: 11px; margin-top: 24px;">
                Jika Anda tidak meminta reset password ini, abaikan email ini. Keamanan akun Anda tetap terjaga.
              </p>
            </div>
          `,
        });
        emailDelivered = true;
        deliveryMessage = "Email verifikasi berhasil dikirim ke rizxstudioproject@gmail.com";
      } catch (sendErr) {
        console.warn("SMTP email dispatch notice:", sendErr);
        deliveryMessage = "Email notification ready (SMTP pending credential setup).";
      }
    } else {
      deliveryMessage = "Kode verifikasi 6 digit telah di-generate untuk akun admin.";
    }

    return NextResponse.json({
      success: true,
      delivered: emailDelivered,
      message: deliveryMessage,
      code: code, // returned for verification handling
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
