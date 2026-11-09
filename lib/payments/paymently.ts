/**
 * Paymently Gateway Service
 * Native Node.js / TypeScript adapter for Paymently (PipraPay) payment gateway.
 * Modeled from WHMCS official gateway module specification.
 */

export interface CreatePaymentlyChargeParams {
  apiKey: string;
  baseUrl?: string;
  fullName: string;
  emailOrMobile: string;
  amount: number;
  invoiceId: string;
  redirectUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  returnType?: 'POST' | 'GET';
  currency?: string; // 'BDT' | 'USD'
}

export interface PaymentlyChargeResponse {
  success: boolean;
  paymentUrl?: string;
  pp_id?: string;
  message?: string;
  raw?: any;
}

export interface PaymentlyVerifyResponse {
  success: boolean;
  status: 'completed' | 'pending' | 'failed';
  amount?: number;
  invoiceId?: string;
  pp_id?: string;
  message?: string;
}

export async function createPaymentlyCharge(
  params: CreatePaymentlyChargeParams
): Promise<PaymentlyChargeResponse> {
  const baseUrl = (params.baseUrl || 'https://paymently.link').replace(/\/+$/, '');
  const url = `${baseUrl}/api/create-charge`;

  const payload = {
    full_name: params.fullName,
    email_mobile: params.emailOrMobile,
    amount: params.amount,
    metadata: {
      invoiceid: params.invoiceId,
    },
    redirect_url: params.redirectUrl,
    cancel_url: params.cancelUrl,
    webhook_url: params.webhookUrl,
    return_type: params.returnType || 'POST',
    currency: params.currency || 'BDT',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'mh-piprapay-api-key': params.apiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text().catch(() => '');
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }

    if (res.ok && data?.pp_url) {
      return {
        success: true,
        paymentUrl: data.pp_url,
        pp_id: data.pp_id,
        raw: data,
      };
    }

    const errorMessage = data?.message ||
      (responseText.toLowerCase().includes('internal server error') || responseText.startsWith('Internal')
        ? 'Paymently Gateway service is currently returning an Internal Server Error. Please verify your Paymently API Key in Admin Settings.'
        : `Paymently Gateway returned HTTP ${res.status}`);

    return {
      success: false,
      message: errorMessage,
      raw: data || responseText,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to connect to Paymently service',
    };
  }
}

export async function verifyPaymentlyPayment(
  ppId: string,
  apiKey: string,
  baseUrl: string = 'https://paymently.link'
): Promise<PaymentlyVerifyResponse> {
  const cleanBase = (baseUrl || 'https://paymently.link').replace(/\/+$/, '');
  const url = `${cleanBase}/api/verify-payments`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'mh-piprapay-api-key': apiKey,
      },
      body: JSON.stringify({ pp_id: ppId }),
    });

    const responseText = await res.text().catch(() => '');
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }

    if (res.ok && data?.status && String(data.status).toLowerCase() === 'completed') {
      return {
        success: true,
        status: 'completed',
        amount: data.amount ? parseFloat(data.amount) : undefined,
        invoiceId: data.metadata?.invoiceid,
        pp_id: ppId,
      };
    }

    return {
      success: false,
      status: (data?.status ? String(data.status).toLowerCase() : 'failed') as any,
      message: data?.message || 'Payment verification failed or not completed',
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      message: err.message || 'Error connecting to Paymently verification endpoint',
    };
  }
}
