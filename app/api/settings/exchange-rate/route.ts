import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.getExchangeRateSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { api_key, manual_rate, auto_refresh, sync_now } = body;

    let settings = await db.getExchangeRateSettings();

    if (api_key !== undefined) {
      settings.api_key = String(api_key).trim();
    }
    if (manual_rate !== undefined) {
      const parsedRate = Number(manual_rate);
      if (!isNaN(parsedRate) && parsedRate > 0) {
        settings.rate = parsedRate;
        settings.last_updated = new Date().toISOString();
        settings.source = 'Manual Override';
      }
    }
    if (auto_refresh !== undefined) {
      settings.auto_refresh = Boolean(auto_refresh);
    }

    // 1. ALWAYS save and persist all settings (api_key, manual_rate, auto_refresh) directly to disk
    await db.saveExchangeRateSettings(settings);

    // 2. If sync_now explicitly requested, trigger live fetch with exchangerate-api.com
    if (sync_now) {
      try {
        const liveRate = await db.syncExchangeRate(settings.api_key);
        if (liveRate && typeof liveRate === 'number' && !isNaN(liveRate)) {
          settings.rate = liveRate;
          settings.source = settings.api_key ? 'ExchangeRate-API' : 'Open Exchange Rate';
          settings.last_updated = new Date().toISOString();
          await db.saveExchangeRateSettings(settings);
        }
      } catch (err: any) {
        console.warn('Sync live rate error:', err.message);
      }
    }

    // Return freshest persisted settings
    const updatedSettings = await db.getExchangeRateSettings();

    return NextResponse.json({
      success: true,
      message: 'Exchange rate settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
