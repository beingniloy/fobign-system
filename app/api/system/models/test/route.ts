import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { provider_id, upstream_model } = body;

    if (!upstream_model || !upstream_model.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Upstream model identifier cannot be empty.',
      }, { status: 400 });
    }

    const provider = provider_id ? db.getProvider(provider_id) : null;
    if (!provider) {
      return NextResponse.json({
        success: false,
        error: `Provider '${provider_id || 'unknown'}' not found in database.`,
      }, { status: 404 });
    }

    if (!provider.is_active) {
      return NextResponse.json({
        success: false,
        error: `Provider '${provider.name}' is currently disabled. Please enable provider before testing.`,
      }, { status: 400 });
    }

    const providerType = (provider.type || 'custom').toLowerCase();
    const apiKey = provider.api_key || process.env.GEMINI_API_KEY || '';

    // Test Gemini natively
    if (providerType === 'gemini') {
      try {
        const geminiClient = new GoogleGenAI({
          apiKey: apiKey && apiKey !== 'SERVER_MANAGED' ? apiKey : (process.env.GEMINI_API_KEY || 'SERVER_MANAGED'),
        });
        const modelName = upstream_model.includes('/') ? upstream_model.split('/').pop()! : upstream_model;
        const response = await geminiClient.models.generateContent({
          model: modelName || 'gemini-2.5-flash',
          contents: 'Say OK',
        });
        const latency = Date.now() - startTime;
        return NextResponse.json({
          success: true,
          latency_ms: latency,
          message: `Gemini connectivity verified (${latency}ms). Upstream response: ${response.text?.slice(0, 30) || 'OK'}`,
        });
      } catch (geminiErr: any) {
        return NextResponse.json({
          success: false,
          error: `Gemini API test failed: ${geminiErr.message || String(geminiErr)}`,
        }, { status: 400 });
      }
    }

    // Anthropic Native Protocol
    if (providerType === 'anthropic') {
      const endpoint = `${provider.base_url.replace(/\/+$/, '')}/messages`;
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 12000);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: upstream_model,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
          signal: ctrl.signal,
        });
        clearTimeout(timeout);
        const latency = Date.now() - startTime;

        if (!res.ok) {
          const errText = await res.text();
          let parsedMsg = errText;
          try {
            const parsed = JSON.parse(errText);
            parsedMsg = parsed.error?.message || errText;
          } catch {}
          return NextResponse.json({
            success: false,
            error: `Anthropic test failed (HTTP ${res.status}): ${parsedMsg}`,
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          latency_ms: latency,
          message: `Anthropic connectivity verified (${latency}ms).`,
        });
      } catch (anthropicErr: any) {
        clearTimeout(timeout);
        return NextResponse.json({
          success: false,
          error: `Anthropic connection error: ${anthropicErr.message || 'Timeout/Network failure'}`,
        }, { status: 400 });
      }
    }

    // Standard OpenAI Compatible Endpoints (OpenAI, DeepSeek, Groq, Mistral, Ollama, Custom)
    let baseUrl = provider.base_url.replace(/\/+$/, '');
    if (!baseUrl.endsWith('/chat/completions')) {
      if (baseUrl.endsWith('/v1')) {
        baseUrl = `${baseUrl}/chat/completions`;
      } else {
        baseUrl = `${baseUrl}/chat/completions`;
      }
    }

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey && apiKey !== 'SERVER_MANAGED') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const res = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: upstream_model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      const latency = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text();
        let parsedMsg = errText;
        try {
          const parsed = JSON.parse(errText);
          parsedMsg = parsed.error?.message || errText;
        } catch {}
        return NextResponse.json({
          success: false,
          error: `Upstream returned HTTP ${res.status}: ${parsedMsg.slice(0, 200)}`,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        latency_ms: latency,
        message: `Upstream model '${upstream_model}' verified successfully (${latency}ms).`,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      return NextResponse.json({
        success: false,
        error: `Failed to reach upstream endpoint: ${fetchErr.message || 'Connection timeout or invalid host'}`,
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: `Model test exception: ${err.message}`,
    }, { status: 500 });
  }
}

