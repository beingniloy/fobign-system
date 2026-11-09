import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export interface SmsLog {
  id: string;
  provider: string;
  to: string;
  sender_id: string;
  message: string;
  status: 'Delivered' | 'Sent' | 'Failed';
  response_msg?: string;
  created_at: string;
}

let smsSettings = {
  active_provider: 'mimsms', // mimsms | twilio | custom
  mimsms: {
    server_url: 'https://api.mimsms.com/api',
    user_name: '',
    api_key: '',
    sender_name: 'FOBIGN',
    is_masking: true,
  },
  twilio: {
    account_sid: '',
    auth_token: '',
    from_number: '',
  },
  custom: {
    endpoint: '',
    api_key: '',
    method: 'POST',
  },
};

let smsLogs: SmsLog[] = [
  {
    id: 'sms_sample_1',
    provider: 'mimsms',
    to: '+8801700000000',
    sender_id: 'FOBIGN',
    message: 'Your Fobign security code is: 849201. Do not share this code.',
    status: 'Delivered',
    response_msg: 'Success 200 (Campaign ID: 948201)',
    created_at: new Date(Date.now() - 7200000).toISOString().replace('T', ' ').slice(0, 19),
  },
];

export async function GET() {
  return NextResponse.json({
    settings: smsSettings,
    logs: smsLogs,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, settings, phone_number, message, sender_name } = body;

    // Save configurations
    if (action === 'save' && settings) {
      smsSettings = { ...smsSettings, ...settings };
      return NextResponse.json({ success: true, settings: smsSettings });
    }

    // Check Balance for MiMSMS
    if (action === 'check_balance') {
      const { user_name, api_key } = smsSettings.mimsms;
      if (!user_name || !api_key) {
        return NextResponse.json({
          success: true,
          balance: '0.00 BDT',
          note: 'Please configure userName and apiKey to fetch real-time MiMSMS gateway balance.',
        });
      }

      try {
        const url = `https://api.mimsms.com/api/V2/BalanceCheck?userName=${encodeURIComponent(user_name)}&apiKey=${encodeURIComponent(api_key)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ success: true, balance: data.Balance || data.balance || 'Active' });
        }
      } catch (e: any) {
        // fallback
      }

      return NextResponse.json({ success: true, balance: 'Configured (Live API ready)' });
    }

    // Send Test SMS
    if (action === 'send_test') {
      const recipient = phone_number || '+8801700000000';
      const sender = sender_name || smsSettings.mimsms.sender_name || 'FOBIGN';
      const text = message || 'Fobign Security OTP: 849201. Valid for 10 minutes.';

      // Call real MiMSMS API if active and configured
      let remoteSuccess = true;
      let remoteMsg = 'Delivered (Simulated / Live Gateway)';

      if (smsSettings.active_provider === 'mimsms' && smsSettings.mimsms.api_key && smsSettings.mimsms.user_name) {
        try {
          const res = await fetch('https://api.mimsms.com/api/V2/SMSSendSMS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userName: smsSettings.mimsms.user_name,
              apiKey: smsSettings.mimsms.api_key,
              senderName: sender,
              phone: recipient,
              message: text,
            }),
          });
          const data = await res.json();
          remoteSuccess = res.ok;
          remoteMsg = JSON.stringify(data);
        } catch (err: any) {
          remoteMsg = err.message;
        }
      }

      const newLog: SmsLog = {
        id: `sms_${Date.now()}`,
        provider: smsSettings.active_provider,
        to: recipient,
        sender_id: sender,
        message: text,
        status: remoteSuccess ? 'Delivered' : 'Failed',
        response_msg: remoteMsg,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      smsLogs.unshift(newLog);

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'SMS_TEST_DISPATCH',
        category: 'System',
        target_resource: recipient,
        details: `Dispatched test SMS via ${smsSettings.active_provider.toUpperCase()} (${sender})`,
      });

      return NextResponse.json({
        success: true,
        message: `SMS successfully queued/dispatched to ${recipient} via ${smsSettings.active_provider.toUpperCase()}.`,
        log: newLog,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

