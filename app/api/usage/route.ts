import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  
  // If specific user requested, get that user's logs, else aggregate all communication/usage logs
  let logs: any[] = [];
  if (userId) {
    const user = db.getOrCreateUser(userId);
    logs = db.getUserUsage(user.id);
  } else {
    // Platform-wide usage logs for admin analytics
    const allUsers = db.getAllUsers ? db.getAllUsers() : [];
    for (const u of allUsers) {
      const uLogs = db.getUserUsage(u.id);
      logs.push(...uLogs);
    }
    if (logs.length === 0 && db.communicationLogs) {
      logs = db.communicationLogs;
    }
  }

  let totalCost = 0;
  let totalTokens = 0;
  let totalRequests = logs.length;

  for (const log of logs) {
    totalCost += log.total_cost || 0;
    totalTokens += log.total_tokens || 0;
  }

  // Group by model for breakdown from database
  const modelCounts: Record<string, { requests: number; tokens: number; cost: number; model_id: string }> = {};
  for (const log of logs) {
    const m = log.model || 'merin-v1.0';
    if (!modelCounts[m]) {
      modelCounts[m] = { requests: 0, tokens: 0, cost: 0, model_id: m };
    }
    modelCounts[m].requests += 1;
    modelCounts[m].tokens += log.total_tokens || 0;
    modelCounts[m].cost += log.total_cost || 0;
  }

  const allModels = db.getAllModels ? db.getAllModels() : [];
  const modelBreakdown = Object.values(modelCounts).map((mc) => {
    const modelDef = allModels.find((m: any) => m.id === mc.model_id);
    const share = totalTokens > 0
      ? (mc.tokens / totalTokens) * 100
      : (totalRequests > 0 ? (mc.requests / totalRequests) * 100 : 0);
    return {
      id: mc.model_id,
      name: modelDef?.display_name || mc.model_id,
      provider: modelDef?.provider || 'AI',
      requests: mc.requests,
      tokensNum: mc.tokens,
      tokens: mc.tokens >= 1000000
        ? `${(mc.tokens / 1000000).toFixed(1)}M`
        : (mc.tokens >= 1000 ? `${(mc.tokens / 1000).toFixed(1)}k` : String(mc.tokens)),
      cost: mc.cost,
      share: parseFloat(share.toFixed(1)),
      shareLabel: `${share.toFixed(1)}%`,
    };
  });

  return NextResponse.json({
    metrics: {
      cost: parseFloat(totalCost.toFixed(4)),
      requests: totalRequests,
      tokens: totalTokens,
      tokensFormatted: totalTokens >= 1000000
        ? `${(totalTokens / 1000000).toFixed(1)}M`
        : (totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : String(totalTokens)),
    },
    modelBreakdown,
    recentLogs: logs.slice(-30),
  });
}
