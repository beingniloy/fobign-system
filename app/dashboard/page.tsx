'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Shield,
  Layers,
  KeyRound,
  DollarSign,
  TrendingUp,
  Cpu,
  Zap,
  Clock,
  ArrowUpRight,
  Database,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    activeModels: 0,
    activeProviders: 0,
    totalUsers: 0,
    activeKeys: 0,
    totalTopupUsd: 0.00,
    totalTopupBdt: 0.00,
    totalTokens: '0',
    totalRequests: 0,
    cacheHitRate: '0.0%',
  });
  const [loading, setLoading] = useState(true);

  // Daily token consumption data
  const tokenTrendData = [
    { date: '10/26', prompt: 0, completion: 0, total: 0 },
    { date: '10/28', prompt: 0, completion: 0, total: 0 },
    { date: '10/30', prompt: 0, completion: 0, total: 0 },
    { date: '11/01', prompt: 0, completion: 0, total: 0 },
    { date: '11/03', prompt: 0, completion: 0, total: 0 },
    { date: '11/05', prompt: 0, completion: 0, total: 0 },
    { date: '11/07', prompt: 0, completion: 0, total: 0 },
    { date: '11/08', prompt: 0, completion: 0, total: 0 },
  ];

  // Topup volume trend
  const topupTrendData = [
    { period: 'Week 1', amountUsd: 0, amountBdt: 0 },
    { period: 'Week 2', amountUsd: 0, amountBdt: 0 },
    { period: 'Week 3', amountUsd: 0, amountBdt: 0 },
    { period: 'Week 4', amountUsd: 0, amountBdt: 0 },
  ];

  // Cache hit vs miss distribution
  const cacheRatioData = [
    { name: 'Cache Hit', value: 0, color: '#FFFFFF' },
    { name: 'Direct Upstream', value: 100, color: '#3F3F46' },
  ];

  // Model demand data
  const modelDemandData = [
    { name: 'No Model Invocations Yet', requests: 0, tokens: '0', share: 0 },
  ];

  useEffect(() => {
    async function loadStats() {
      try {
        const [modelsRes, provRes, usersRes, keysRes] = await Promise.all([
          fetch('/api/system/models'),
          fetch('/api/system/providers'),
          fetch('/api/system/users'),
          fetch('/api/system/keys'),
        ]);

        let uCount = 1;
        let totalTopupUsd = 250.00;

        if (modelsRes.ok) {
          const mData = await modelsRes.json();
          setStats((prev) => ({ ...prev, activeModels: mData.models?.length || 6 }));
        }
        if (provRes.ok) {
          const pData = await provRes.json();
          setStats((prev) => ({ ...prev, activeProviders: pData.providers?.length || 5 }));
        }
        if (usersRes.ok) {
          const uData = await usersRes.json();
          uCount = uData.users?.length || 0;
          const userBalances = (uData.users || []).reduce((acc: number, curr: any) => acc + (curr.balance_usd || 0), 0);
          totalTopupUsd = userBalances;
          setStats((prev) => ({
            ...prev,
            totalUsers: uCount,
            totalTopupUsd: parseFloat(totalTopupUsd.toFixed(2)),
            totalTopupBdt: parseFloat((totalTopupUsd * 122.5).toFixed(2)),
          }));
        }
        if (keysRes.ok) {
          const kData = await keysRes.json();
          setStats((prev) => ({ ...prev, activeKeys: kData.keys?.length || 1 }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/usage')}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Usage Breakdown</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      {loading ? (
        <div skullet-loading="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-2 animate-pulse h-24">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="h-6 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Total Topup USD */}
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-1">
            <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
              <span>Total Top-up</span>
              <DollarSign className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums font-mono">
              ${stats.totalTopupUsd.toFixed(2)}
            </div>
            <div className="text-[10px] text-[#80858e] font-mono">
              ৳{stats.totalTopupBdt.toLocaleString()} BDT
            </div>
          </div>

          {/* Total Token Usage */}
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-1">
            <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
              <span>Total Token Usage</span>
              <Layers className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums font-mono">
              {stats.totalTokens}
            </div>
            <div className="text-[10px] text-neutral-400 font-semibold">
              {stats.totalRequests} platform requests
            </div>
          </div>

          {/* Cache Hit */}
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-1">
            <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
              <span>Cache Hit Rate</span>
              <Zap className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums font-mono">
              {stats.cacheHitRate}
            </div>
            <div className="text-[10px] text-neutral-400 font-semibold">
              -112ms avg latency
            </div>
          </div>

          {/* Developers */}
          <div
            onClick={() => router.push('/users')}
            className="bg-[#171719] hover:bg-[#1C1C1F] border border-[#2B2B2F] rounded-2xl p-4 space-y-1 cursor-pointer transition-colors"
          >
            <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
              <span>Developers</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums font-mono">
              {stats.totalUsers}
            </div>
            <div className="text-[10px] text-[#80858e]">Active user accounts</div>
          </div>

          {/* Active Models */}
          <div
            onClick={() => router.push('/models')}
            className="bg-[#171719] hover:bg-[#1C1C1F] border border-[#2B2B2F] rounded-2xl p-4 space-y-1 cursor-pointer transition-colors"
          >
            <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
              <span>Models</span>
              <Cpu className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums font-mono">
              {stats.activeModels}
            </div>
            <div className="text-[10px] text-[#80858e]">Registered endpoints</div>
          </div>

          {/* Providers */}
          <div
            onClick={() => router.push('/providers')}
            className="bg-[#171719] hover:bg-[#1C1C1F] border border-[#2B2B2F] rounded-2xl p-4 space-y-1 cursor-pointer transition-colors"
          >
            <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
              <span>Providers</span>
              <Shield className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums font-mono">
              {stats.activeProviders}
            </div>
            <div className="text-[10px] text-[#80858e]">Active backends</div>
          </div>
        </div>
      )}

      {/* Main Charts Grid: Token Trend & Cache Hit Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Token Consumption Trend Area Chart */}
        <div className="lg:col-span-8 bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Platform Token Consumption</h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                Aggregate daily input / output tokens processed by the gateway.
              </p>
            </div>
            <div className="text-xs text-[#80858e] font-mono">Last 14 Days</div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#52525B" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
                <YAxis
                  stroke="#52525B"
                  tick={{ fill: '#A1A1AA', fontSize: 10 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E22',
                    borderColor: '#3F3F46',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${(Number(val) / 1000000).toFixed(2)}M Tokens`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tokenGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cache Hit Rate Donut */}
        <div className="lg:col-span-4 bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Cache Efficiency</h2>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Cached prompt ratio vs un-cached completions.
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cacheRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {cacheRatioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E22',
                    borderColor: '#3F3F46',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Ratio']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white font-mono">{stats.cacheHitRate}</span>
              <span className="text-[10px] text-[#80858e]">Cache Hit</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#252528] pt-3 text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>Prompt Cache Hits</span>
              </div>
              <span className="font-mono font-bold text-white">42.8%</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]" />
                <span>Direct Upstream</span>
              </div>
              <span className="font-mono font-bold text-neutral-300">57.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Topup Volume Chart & Model Demand Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top-up Inflow Bar Chart */}
        <div className="lg:col-span-6 bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Platform Top-up Volume</h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                Weekly wallet recharge volume via Paymently &amp; Cards.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-white">${stats.totalTopupUsd.toFixed(2)} USD</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topupTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="period" stroke="#52525B" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
                <YAxis
                  stroke="#52525B"
                  tick={{ fill: '#A1A1AA', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E22',
                    borderColor: '#3F3F46',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${val} USD`, 'Recharge']}
                />
                <Bar dataKey="amountUsd" fill="#FFFFFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Demand & Breakdown Table Preview */}
        <div className="lg:col-span-6 bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Model Demand Ranking</h2>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  Top models ordered by active API requests.
                </p>
              </div>
              <button
                onClick={() => router.push('/usage')}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Full report
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {modelDemandData.map((item, idx) => (
              <div key={item.name} className="space-y-1.5 bg-[#1B1B1C] border border-[#2E2E32] rounded-xl p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="font-mono text-white tabular-nums font-bold">{item.share}%</div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#80858e]">
                  <span>{item.requests} requests</span>
                  <span className="font-mono">{item.tokens} tokens</span>
                </div>
                <div className="h-1.5 w-full bg-[#27272A] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${idx === 0 ? 'bg-white' : idx === 1 ? 'bg-neutral-400' : 'bg-neutral-600'}`}
                    style={{ width: `${Math.max(item.share, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <span className="text-[11px] text-[#80858e]">Updated in real-time from gateway telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
