'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  CheckCircle2,
  Check,
  Server,
  Activity,
  Sliders,
} from 'lucide-react';
import { RoleDefinition } from '@/lib/types';

interface GranularPermission {
  id: string;
  name: string;
  category: 'inference' | 'telemetry' | 'operational';
  method: 'POST' | 'GET' | 'ALL';
  endpoint: string;
  description: string;
}

const GRANULAR_PERMISSIONS: GranularPermission[] = [
  // 1. Core AI Inference
  {
    id: 'endpoint:chat',
    name: 'Chat Completions',
    category: 'inference',
    method: 'POST',
    endpoint: '/v1/chat/completions',
    description: 'Execute OpenAI-compatible chat completions and reasoning streams.',
  },
  {
    id: 'endpoint:messages',
    name: 'Claude Messages API',
    category: 'inference',
    method: 'POST',
    endpoint: '/v1/messages',
    description: 'Execute Anthropic Claude-compatible messages endpoints.',
  },
  {
    id: 'endpoint:moderation',
    name: 'Content Moderation',
    category: 'inference',
    method: 'POST',
    endpoint: '/v1/moderations',
    description: 'Automated safety classification and prompt moderation checks.',
  },
  {
    id: 'endpoint:embeddings',
    name: 'Vector Embeddings',
    category: 'inference',
    method: 'POST',
    endpoint: '/v1/embeddings',
    description: 'Generate high-dimensional semantic vector embeddings.',
  },
  {
    id: 'endpoint:models',
    name: 'Model Catalog & Discovery',
    category: 'inference',
    method: 'GET',
    endpoint: '/v1/models',
    description: 'Query available virtualized upstream models and parameters.',
  },

  // 2. Platform & Telemetry Controls
  {
    id: 'endpoint:usage',
    name: 'Usage & Token Telemetry',
    category: 'telemetry',
    method: 'GET',
    endpoint: '/api/usage',
    description: 'Inspect real-time token consumption logs and aggregated metrics.',
  },
  {
    id: 'endpoint:ratelimits',
    name: 'Rate Limit Controls',
    category: 'telemetry',
    method: 'GET',
    endpoint: '/api/rate-limits',
    description: 'Inspect throughput telemetry and sliding-window RPM/TPM usage.',
  },
  {
    id: 'endpoint:keys',
    name: 'API Key Management',
    category: 'telemetry',
    method: 'ALL',
    endpoint: '/api/keys',
    description: 'Provision, configure, and revoke developer API keys and hashes.',
  },

  // 3. Operational & Support Privileges
  {
    id: 'staff:tickets',
    name: 'Support Desk',
    category: 'operational',
    method: 'ALL',
    endpoint: '/api/tickets',
    description: 'Inspect user tickets, dispatch replies, and change ticket priorities.',
  },
  {
    id: 'staff:billing',
    name: 'Billing Management',
    category: 'operational',
    method: 'ALL',
    endpoint: '/api/billing',
    description: 'Audit top-up invoices, adjust credit balances, and review tax filings.',
  },
  {
    id: 'staff:settings',
    name: 'Global Platform Settings',
    category: 'operational',
    method: 'ALL',
    endpoint: '/api/settings/*',
    description: 'Configure exchange rates, branding, maintenance mode, and announcements.',
  },
  {
    id: 'staff:users',
    name: 'User Account Control',
    category: 'operational',
    method: 'ALL',
    endpoint: '/api/system/users',
    description: 'Inspect developer records, adjust balances, and toggle account statuses.',
  },
];

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // New Role Modal
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([
    'endpoint:chat',
    'endpoint:models',
    'endpoint:usage',
  ]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/roles');
        if (res.ok) {
          const data = await res.json();
          if (data.roles && data.roles.length > 0) {
            setRoles(data.roles);
            setSelectedRoleId(data.roles[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (permissionId: string) => {
    if (!selectedRole) return;
    const currentPermissions = selectedRole.permissions || [];
    let updated: string[];

    if (currentPermissions.includes(permissionId)) {
      updated = currentPermissions.filter((p) => p !== permissionId);
    } else {
      updated = [...currentPermissions, permissionId];
    }

    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: updated } : r))
    );
  };

  const handleSelectAllCategory = (category: 'inference' | 'telemetry' | 'operational') => {
    if (!selectedRole) return;
    const categoryPerms = GRANULAR_PERMISSIONS.filter((p) => p.category === category).map((p) => p.id);
    const hasAll = categoryPerms.every((p) => selectedRole.permissions.includes(p));

    let updated: string[];
    if (hasAll) {
      updated = selectedRole.permissions.filter((p) => !categoryPerms.includes(p));
    } else {
      updated = Array.from(new Set([...selectedRole.permissions, ...categoryPerms]));
    }

    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: updated } : r))
    );
  };

  const handleSaveCurrentRolePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRole.id,
          name: selectedRole.name,
          description: selectedRole.description,
          permissions: selectedRole.permissions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Permissions for role "${selectedRole.name}" updated successfully.`);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (e: any) {
      setFeedback('Error saving permissions: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissions: newRolePermissions,
        }),
      });
      const data = await res.json();
      if (data.success && data.role) {
        setRoles((prev) => [...prev, data.role]);
        setSelectedRoleId(data.role.id);
        setFeedback(`New role "${newRoleName}" created successfully.`);
        setNewRoleName('');
        setNewRoleDesc('');
        setShowAddRole(false);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (e: any) {
      setFeedback('Error creating role: ' + e.message);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-['Nunito',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Roles</h1>
        </div>

        <button
          onClick={() => setShowAddRole(true)}
          className="bg-white hover:bg-neutral-200 text-black font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-xs self-start sm:self-auto shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Role</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Roles Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} skullet-loading="true" className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-4 space-y-3 animate-pulse h-24">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-white/10" />
                <div className="h-3 w-12 bg-white/10 rounded" />
              </div>
              <div className="h-4 w-20 bg-white/10 rounded" />
            </div>
          ))
        ) : (
          roles.map((role) => {
          const isSelected = role.id === selectedRole?.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-[#222226] border-[#3E3E44] shadow-xs'
                  : 'bg-[#1B1B1C] border-[#2E2E32] hover:bg-[#202023] hover:border-[#38383D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'bg-white text-black' : 'bg-[#28282C] text-[#80858e]'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#151517] text-[#80858e]">
                  {(role.permissions || []).length} perms
                </span>
              </div>
              <div className="mt-2.5">
                <span className="font-bold text-white text-xs block truncate">{role.name}</span>
                <span className="text-[10px] text-[#80858e] block truncate mt-0.5">{role.description}</span>
              </div>
            </button>
          );
        }))}
      </div>

      {/* Granular Permission Editor Panel */}
      {selectedRole && (
        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2E2E32] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Permissions: <span className="text-white underline underline-offset-4">{selectedRole.name}</span>
                </h2>
                <span className="text-[10px] font-mono bg-[#151517] border border-[#2E2E32] px-2 py-0.5 rounded-md text-[#80858e]">
                  {selectedRole.id}
                </span>
              </div>
              <p className="text-xs text-[#9ca3af] mt-0.5">{selectedRole.description}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleSaveCurrentRolePermissions}
                disabled={saving}
                className="bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
              </button>
            </div>
          </div>

          {/* Category 1: Inference */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Inference Endpoints
              </h3>
              <button
                type="button"
                onClick={() => handleSelectAllCategory('inference')}
                className="text-[11px] text-[#9ca3af] hover:text-white underline cursor-pointer"
              >
                Toggle All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GRANULAR_PERMISSIONS.filter((p) => p.category === 'inference').map((perm) => {
                const isChecked = (selectedRole.permissions || []).includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-[#222226] border-[#3E3E44]'
                        : 'bg-[#151517] border-[#2E2E32] opacity-75 hover:opacity-100 hover:border-[#3E3E44]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{perm.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#202024] text-neutral-300 border border-[#2E2E32]">
                          {perm.method}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#80858e]">{perm.endpoint}</div>
                      <div className="text-[11px] text-[#9ca3af] leading-tight pt-0.5">{perm.description}</div>
                    </div>

                    <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 mt-0.5 p-0.5 ${
                      isChecked ? 'bg-white' : 'bg-[#2E2E32]'
                    }`}>
                      <div className={`w-4 h-4 rounded-full transition-transform ${
                        isChecked ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category 2: Telemetry */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Telemetry & API Keys
              </h3>
              <button
                type="button"
                onClick={() => handleSelectAllCategory('telemetry')}
                className="text-[11px] text-[#9ca3af] hover:text-white underline cursor-pointer"
              >
                Toggle All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GRANULAR_PERMISSIONS.filter((p) => p.category === 'telemetry').map((perm) => {
                const isChecked = (selectedRole.permissions || []).includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-[#222226] border-[#3E3E44]'
                        : 'bg-[#151517] border-[#2E2E32] opacity-75 hover:opacity-100 hover:border-[#3E3E44]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{perm.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#202024] text-neutral-300 border border-[#2E2E32]">
                          {perm.method}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#80858e]">{perm.endpoint}</div>
                      <div className="text-[11px] text-[#9ca3af] leading-tight pt-0.5">{perm.description}</div>
                    </div>

                    <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 mt-0.5 p-0.5 ${
                      isChecked ? 'bg-white' : 'bg-[#2E2E32]'
                    }`}>
                      <div className={`w-4 h-4 rounded-full transition-transform ${
                        isChecked ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category 3: Operational */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Operational Settings
              </h3>
              <button
                type="button"
                onClick={() => handleSelectAllCategory('operational')}
                className="text-[11px] text-[#9ca3af] hover:text-white underline cursor-pointer"
              >
                Toggle All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GRANULAR_PERMISSIONS.filter((p) => p.category === 'operational').map((perm) => {
                const isChecked = (selectedRole.permissions || []).includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-[#222226] border-[#3E3E44]'
                        : 'bg-[#151517] border-[#2E2E32] opacity-75 hover:opacity-100 hover:border-[#3E3E44]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{perm.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#202024] text-neutral-300 border border-[#2E2E32]">
                          {perm.method}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#80858e]">{perm.endpoint}</div>
                      <div className="text-[11px] text-[#9ca3af] leading-tight pt-0.5">{perm.description}</div>
                    </div>

                    <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 mt-0.5 p-0.5 ${
                      isChecked ? 'bg-white' : 'bg-[#2E2E32]'
                    }`}>
                      <div className={`w-4 h-4 rounded-full transition-transform ${
                        isChecked ? 'bg-black translate-x-4' : 'bg-white translate-x-0'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2E2E32] pb-3">
              <h3 className="text-sm font-bold text-white">Create Role</h3>
              <button onClick={() => setShowAddRole(false)} className="text-[#80858e] hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewRole} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[#80858e] font-medium">Role Name</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Auditor or Support Agent"
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#4A4A50]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#80858e] font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Role description..."
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#4A4A50]"
                />
              </div>

              {/* Initial Permissions Selection */}
              <div className="space-y-2">
                <label className="text-[#80858e] font-medium block">Endpoint Permissions</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-[#151517] rounded-xl border border-[#2E2E32]">
                  {GRANULAR_PERMISSIONS.map((perm) => {
                    const isSelected = newRolePermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => {
                          if (isSelected) {
                            setNewRolePermissions((prev) => prev.filter((p) => p !== perm.id));
                          } else {
                            setNewRolePermissions((prev) => [...prev, perm.id]);
                          }
                        }}
                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                          isSelected ? 'bg-[#202024] border-[#3E3E44] text-white' : 'bg-transparent border-transparent text-[#80858e] hover:bg-[#1E1E22]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{perm.name}</span>
                          <span className="text-[10px] font-mono text-[#80858e]">{perm.endpoint}</span>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-white border-white text-black' : 'border-[#2E2E32]'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#2E2E32]">
                <button
                  type="button"
                  onClick={() => setShowAddRole(false)}
                  className="px-4 py-2 rounded-xl bg-[#202023] text-white hover:bg-[#28282C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

