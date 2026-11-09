import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const settings = db.getMailSettings();
    const logs = db.getMailLogs();
    return NextResponse.json({
      settings,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, settings, test_email, subject, message } = body;

    if (action === 'save' && settings) {
      const saved = db.saveMailSettings(settings);
      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'MAIL_SETTINGS_UPDATED',
        category: 'System',
        details: `Saved mail configuration. Active provider: ${saved.active_provider || saved.provider}`,
      });
      return NextResponse.json({ success: true, settings: saved });
    }

    if (action === 'send_test') {
      const mailSettings = db.getMailSettings();
      const recipient = test_email || 'admin@fobign.com';
      const mailSubject = subject || 'Test Notification from Fobign Mail Engine';
      const mailText = message || 'This is a test notification verifying your dynamic mail engine configuration.';
      const activeProv = mailSettings.active_provider || 'resend';

      let responseId: string | undefined = undefined;
      let remoteError: string | null = null;

      // 1. Resend REST API
      if (activeProv === 'resend') {
        const apiKey = mailSettings.resend?.api_key?.trim() || mailSettings.api_key?.trim();
        if (!apiKey) {
          return NextResponse.json(
            { success: false, error: 'Resend API Key is missing. Please enter your Resend API Key (re_...) and click Save Configuration.' },
            { status: 400 }
          );
        }

        const fromEmail = mailSettings.resend?.from_email?.trim() || mailSettings.sender_email || 'noreply@fobign.com';
        const fromName = mailSettings.resend?.from_name?.trim() || mailSettings.sender_name || 'Fobign Platform';

        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${fromName} <${fromEmail}>`,
              to: [recipient],
              subject: mailSubject,
              text: mailText,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; color: #111111; border: 1px solid #e5e5e5; border-radius: 12px;">
                  <div style="font-weight: 800; font-size: 18px; margin-bottom: 12px; letter-spacing: -0.5px;">FOBIGN</div>
                  <h3 style="font-size: 16px; margin: 0 0 12px; color: #111;">${mailSubject}</h3>
                  <p style="font-size: 14px; color: #333; line-height: 1.6;">${mailText}</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                  <p style="font-size: 11px; color: #888; font-family: monospace;">Delivered via Resend REST Gateway &bull; Sender: ${fromEmail}</p>
                </div>
              `,
            }),
          });

          const resendData = await resendRes.json();
          if (!resendRes.ok) {
            remoteError = resendData.message || resendData.error || `Resend error HTTP ${resendRes.status}`;
          } else {
            responseId = resendData.id;
          }
        } catch (err: any) {
          remoteError = `Network connection to Resend API failed: ${err.message}`;
        }
      }

      // 2. SMTP Gateway (Nodemailer, supporting Supabase SMTP or smtp.resend.com)
      else if (activeProv === 'smtp') {
        const smtpCfg: any = mailSettings.smtp || {};
        const host = smtpCfg.host || 'smtp.resend.com';
        const port = Number(smtpCfg.port) || 587;
        const username = smtpCfg.username || 'resend';
        const password = smtpCfg.password || '';
        const from_email = smtpCfg.from_email || 'noreply@fobign.com';
        const from_name = smtpCfg.from_name || 'Fobign Platform';

        if (!host) {
          return NextResponse.json({ success: false, error: 'SMTP Host is missing. Please configure your SMTP server.' }, { status: 400 });
        }

        try {
          const transporter = nodemailer.createTransport({
            host,
            port,
            secure: smtpCfg.secure || port === 465,
            auth: username ? { user: username, pass: password } : undefined,
            tls: { rejectUnauthorized: false },
          });

          const info = await transporter.sendMail({
            from: `"${from_name}" <${from_email}>`,
            to: recipient,
            subject: mailSubject,
            text: mailText,
            html: `<div>${mailText}</div>`,
          });

          responseId = info.messageId;
        } catch (err: any) {
          remoteError = `SMTP dispatch failed: ${err.message}`;
        }
      }

      // Record in persistent database logs
      const isSuccess = !remoteError;
      const newLog = db.addMailLog({
        to: recipient,
        subject: mailSubject,
        provider: activeProv,
        status: isSuccess ? 'sent' : 'failed',
        response_id: responseId,
        error: remoteError || undefined,
      });

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'MAIL_TEST_DISPATCH',
        category: 'System',
        target_resource: recipient,
        details: isSuccess
          ? `Dispatched test email via ${activeProv.toUpperCase()} to ${recipient} (ID: ${responseId})`
          : `Failed test email via ${activeProv.toUpperCase()} to ${recipient}: ${remoteError}`,
      });

      if (!isSuccess) {
        return NextResponse.json(
          {
            success: false,
            error: remoteError,
            log: newLog,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Email successfully delivered to ${recipient} via ${activeProv.toUpperCase()} (Message ID: ${responseId}). Visible in your Resend dashboard.`,
        log: newLog,
        response_id: responseId,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
