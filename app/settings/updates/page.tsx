'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import type { PlatformUpdate } from '@/lib/types';

export default function UpdatesManagementPage() {
  const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<PlatformUpdate>>({
    title: '',
    description: '',
    category: 'Feature',
    version: '',
    is_published: true,
  });

  const loadUpdates = async () => {
    try {
      const res = await fetch('/api/system/updates');
      if (res.ok) {
        const data = await res.json();
        setUpdates(data.updates || []);
      }
    } catch (err) {
      console.error('Failed to load updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      category: 'Feature',
      version: '',
      is_published: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item: PlatformUpdate) => {
    setEditingId(item.id);
    setForm({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      version: item.version || '',
      is_published: item.is_published,
    });
    setShowModal(true);
  };

  const handleTogglePublish = async (item: PlatformUpdate) => {
    const updated = { ...item, is_published: !item.is_published };
    setUpdates((prev) => prev.map((u) => (u.id === item.id ? updated : u)));

    try {
      const res = await fetch('/api/system/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        loadUpdates();
      } else {
        setFeedback(`Update "${item.title}" is now ${updated.is_published ? 'published' : 'draft'}.`);
      }
    } catch {
      loadUpdates();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete update "${title}"?`)) return;

    try {
      const res = await fetch('/api/system/updates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setUpdates((prev) => prev.filter((u) => u.id !== id));
        setFeedback(`Deleted update "${title}".`);
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;

    setFormLoading(true);
    try {
      const res = await fetch('/api/system/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setFeedback(editingId ? 'Update modified successfully.' : 'New update published to platform.');
        loadUpdates();
      } else {
        alert(data.error || 'Failed to save update.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUpdates = useMemo(() => {
    return updates.filter((u) => {
      const matchCat = categoryFilter === 'ALL' || u.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchSearch =
        !search.trim() ||
        u.title.toLowerCase().includes(search.toLowerCase()) ||
        u.description.toLowerCase().includes(search.toLowerCase()) ||
        (u.version && u.version.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [updates, categoryFilter, search]);

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Header - Strictly clean without & Changelog or description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Updates</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUpdates}
            className="p-2 bg-[#1c1d20] hover:bg-[#282a2e] border border-[#2b2d31] rounded-xl text-[#80858e] hover:text-white transition-colors cursor-pointer"
            title="Refresh Updates"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Update</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white flex items-center justify-between gap-2 shadow-xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-[#80858e] hover:text-white cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#16181b] border border-[#2b2d31] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#101113] border border-[#2b2d31] px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-[#7E828A]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#16181b] text-white">All Categories</option>
              <option value="Feature" className="bg-[#16181b] text-white">Feature</option>
              <option value="Model" className="bg-[#16181b] text-white">Model</option>
              <option value="Security" className="bg-[#16181b] text-white">Security</option>
              <option value="Billing" className="bg-[#16181b] text-white">Billing</option>
              <option value="Announcement" className="bg-[#16181b] text-white">Announcement</option>
            </select>
          </div>
          <span className="text-xs text-[#80858e]">{filteredUpdates.length} updates found</span>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#80858e] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search updates..."
            className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#555861] focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      {/* Updates Table */}
      <div className="bg-[#16181b] border border-[#2b2d31] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div skullet-loading="true" className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#252528] last:border-none gap-4">
                <div className="space-y-1.5 w-1/3">
                  <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-60 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2b2d31] text-[#80858e] bg-[#121316] text-[11px]">
                  <th className="py-3.5 px-5 font-semibold">Update Title &amp; Summary</th>
                  <th className="py-3.5 px-5 font-semibold">Category</th>
                  <th className="py-3.5 px-5 font-semibold">Version / Tag</th>
                  <th className="py-3.5 px-5 font-semibold">Published Date</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232528] text-white">
                {filteredUpdates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#80858e]">
                      No updates found. Click &quot;Publish Update&quot; to broadcast your first announcement.
                    </td>
                  </tr>
                ) : (
                  filteredUpdates.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1c1d20]/60 transition-colors">
                      <td className="py-4 px-5 max-w-md">
                        <div className="font-bold text-white text-xs">{item.title}</div>
                        <div className="text-[11px] text-[#9ca3af] mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/20">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap font-mono text-[11px] text-neutral-400">
                        {item.version || '—'}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap text-neutral-400 text-[11px]">
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          className={`w-11 h-6 rounded-full p-1 transition-colors relative inline-flex items-center cursor-pointer ${
                            item.is_published ? 'bg-white' : 'bg-[#2b2d31]'
                          }`}
                          title={item.is_published ? 'Click to unpublish' : 'Click to publish'}
                        >
                          <div
                            className={`w-4 h-4 rounded-full shadow-xs transition-transform ${
                              item.is_published ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-[#80858e] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit update"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1.5 text-[#80858e] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete update"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#16181b] border border-[#2E2E32] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2E2E32] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Update' : 'New Platform Update'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#80858e] hover:text-white p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Update Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DeepSeek V4.1 Flash Inference Active"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9499a0] mb-1 font-medium">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50 cursor-pointer"
                  >
                    <option value="Feature" className="bg-[#101113] text-white">Feature</option>
                    <option value="Model" className="bg-[#101113] text-white">Model</option>
                    <option value="Security" className="bg-[#101113] text-white">Security</option>
                    <option value="Billing" className="bg-[#101113] text-white">Billing</option>
                    <option value="Announcement" className="bg-[#101113] text-white">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#9499a0] mb-1 font-medium">Version / Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. v2.4.0 or v4.1"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Description / Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the update, newly supported features, performance benchmarks, or changelog details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/50 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="publishedCheckbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="rounded border-[#2E2E32] bg-[#101113] text-white focus:ring-0 cursor-pointer"
                />
                <label htmlFor="publishedCheckbox" className="text-xs text-white cursor-pointer font-medium">
                  Publish immediately to Platform console homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E2E32]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#80858e] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Saving...' : editingId ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

