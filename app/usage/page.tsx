'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Cpu,
  Zap,
} from 'lucide-react';
import ProviderSvglIcon from '@/components/ui/ProviderSvglIcon';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface ModelDemandItem {
  id: string;
  name: string;
  provider: string;
  requests: number;
  tokens: string;
  tokensNum: number;
  share: number;
  shareLabel: string;
}

export default function AdminUsageAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('Last 30 days');
  const [modelUsageData, setModelUsageData] = useState<ModelDemandItem[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalTokensFormatted, setTotalTokensFormatted] = useState('0');

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const data = await res.json();
          if (data.modelBreakdown) {
            setModelUsageData(data.modelBreakdown);
          }
          if (data.metrics) {
            setTotalRequests(data.metrics.requests || 0);
            setTotalTokensFormatted(data.metrics.tokensFormatted || '0');
          }
        }
      } catch (err) {
        console.error('Failed to load usage telemetry', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  const filteredModels = modelUsageData.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Usage &amp; Demand</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white bg-[#1C1D20] border border-[#2B2D31] px-3 py-1.5 rounded-xl font-semibold">
            {timeFilter}
          </span>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-2">
          <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
            <span>Total Invocations</span>
            <Zap className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{totalRequests.toLocaleString()}</div>
          <div className="text-[11px] text-[#80858e]">Across all platform models</div>
        </div>

        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-2">
          <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
            <span>Total Token Usage</span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{totalTokensFormatted}</div>
          <div className="text-[11px] text-[#80858e]">Metered prompt &amp; completions</div>
        </div>

        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-2">
          <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
            <span>Leading Model</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-white truncate">None</div>
          <div className="text-[11px] text-[#80858e]">0.0% market share</div>
        </div>

        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-2">
          <div className="text-xs text-[#80858e] font-medium flex items-center justify-between">
            <span>Cache Hit Rate</span>
            <Cpu className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">0.0%</div>
          <div className="text-[11px] text-[#80858e]">Awaiting gateway traffic</div>
        </div>
      </div>

      {/* Model Demand Chart */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white tracking-tight">Model Demand Distribution</h2>
          <div className="flex flex-wrap items-center gap-2">
            {modelUsageData.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#202024] border border-[#2B2B2F] text-[11px]"
              >
                <ProviderSvglIcon
                  providerIdOrType={item.provider}
                  name={item.name}
                  size={14}
                  className="text-white shrink-0"
                />
                <span className="font-semibold text-white">{item.name}</span>
                <span className="font-mono text-[#80858e]">({item.shareLabel})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={modelUsageData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 140, bottom: 0 }}
            >
              <XAxis type="number" stroke="#52525B" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#52525B"
                tick={{ fill: '#F4F4F5', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E22',
                  borderColor: '#3F3F46',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="requests" fill="#FFFFFF" radius={[0, 6, 6, 0]}>
                {modelUsageData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#FFFFFF' : index === 1 ? '#A1A1AA' : '#52525B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage Breakdown Table Matching User Requirements */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Usage breakdown</h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#80858e] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model or tool..."
              className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#555861] focus:outline-none focus:border-white/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B2B2F] text-[#80858e] text-[11px] font-semibold">
                <th className="py-3 px-3">Model / Tool</th>
                <th className="py-3 px-4 text-right">Requests</th>
                <th className="py-3 px-4 text-right">Tokens</th>
                <th className="py-3 px-4 text-right min-w-[180px]">Share of usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232326]">
              {/* Category Group Header: Models */}
              <tr className="bg-[#141416]/70 font-semibold text-white">
                <td className="py-3 px-3 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Models</span>
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-mono text-neutral-200">
                  {totalRequests}
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-mono text-neutral-200">
                  {totalTokensFormatted}
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-mono text-white">
                  100.0%
                </td>
              </tr>

              {/* Models List */}
              {filteredModels.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#1C1C1F] transition-colors text-white">
                  <td className="py-3.5 px-3 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#202024] flex items-center justify-center shrink-0 border border-white/5">
                        <ProviderSvglIcon
                          providerIdOrType={item.provider}
                          name={item.name}
                          size={16}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-[#80858e] font-mono">{item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right tabular-nums font-mono text-neutral-300">
                    {item.requests}
                  </td>
                  <td className="py-3.5 px-4 text-right tabular-nums font-mono text-neutral-300">
                    {item.tokens}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-white' : idx === 1 ? 'bg-neutral-300' : 'bg-neutral-400'
                          }`}
                          style={{ width: `${Math.max(item.share, 3)}%` }}
                        />
                      </div>
                      <span className="font-mono text-white font-semibold tabular-nums w-12 text-right">
                        {item.shareLabel}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

