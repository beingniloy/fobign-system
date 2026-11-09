'use client';

import React from 'react';
import { X, LogOut, Laptop, Smartphone } from 'lucide-react';

interface DevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutAll?: () => void;
}

export default function DevicesModal({ isOpen, onClose, onLogoutAll }: DevicesModalProps) {
  if (!isOpen) return null;

  const devices = [
    {
      id: 'dev_1',
      name: 'Chrome',
      platform: 'Windows',
      isCurrent: true,
      loginTime: '2026-06-12 17:50:22',
      icon: Laptop,
    },
    {
      id: 'dev_2',
      name: 'OnePlus 8T',
      platform: 'Android 14',
      isCurrent: false,
      loginTime: '2026-06-11 12:30:14',
      icon: Smartphone,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#28282C]">
          <h2 className="text-base font-semibold text-white tracking-tight">Devices management</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#80858e] hover:text-white hover:bg-[#28282C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Devices List */}
        <div className="divide-y divide-[#262629]">
          {devices.map((device) => {
            const Icon = device.icon;
            return (
              <div key={device.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#242427] flex items-center justify-center text-[#9ca3af] shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{device.name}</span>
                      <span className="text-[#80858e]">{device.platform}</span>
                      {device.isCurrent && (
                        <span className="text-[10px] bg-[#2E2E32] text-[#cbd5e1] px-1.5 py-0.5 rounded font-medium">
                          Current device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#757a84] tabular-nums">
                      Login time: {device.loginTime}
                    </div>
                  </div>
                </div>

                {!device.isCurrent && (
                  <button
                    onClick={onClose}
                    className="p-1.5 text-[#80858e] hover:text-white hover:bg-[#28282C] rounded-lg transition-colors"
                    title="Log out device"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#28282C] flex items-center justify-between">
          <span className="text-xs text-[#9ca3af]">Log out of all devices</span>
          <button
            onClick={() => {
              if (onLogoutAll) onLogoutAll();
              onClose();
            }}
            className="px-4 py-1.5 rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
