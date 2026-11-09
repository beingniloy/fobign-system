import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decryptPayload } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const encryptedLogs = db.getUserCommunicationLogs(userId);
    const user = db.getUser(userId);

    // Decrypt on-the-fly for authorized administrator view
    const decryptedLogs = encryptedLogs.map((log) => {
      let promptData: any = log.encrypted_prompt;
      let responseText = log.encrypted_response;

      try {
        const decryptedPromptStr = decryptPayload(log.encrypted_prompt);
        try {
          promptData = JSON.parse(decryptedPromptStr);
        } catch {
          promptData = decryptedPromptStr;
        }
      } catch {
        promptData = log.encrypted_prompt;
      }

      try {
        responseText = decryptPayload(log.encrypted_response);
      } catch {
        responseText = log.encrypted_response;
      }

      return {
        id: log.id,
        user_id: log.user_id,
        user_email: log.user_email || user?.email,
        endpoint: log.endpoint,
        model: log.model,
        prompt: promptData,
        response: responseText,
        prompt_tokens: log.prompt_tokens,
        completion_tokens: log.completion_tokens,
        total_tokens: log.total_tokens,
        latency_ms: log.latency_ms,
        status_code: log.status_code,
        client_ip: log.client_ip,
        created_at: log.created_at,
        is_e2ee: true,
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        status: user?.status,
        restricted_until: user?.restricted_until,
      },
      logs: decryptedLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

