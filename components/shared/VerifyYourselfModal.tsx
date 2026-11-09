'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, RefreshCw, Copy, Check } from 'lucide-react';
import CodeSlots, { CodeSlotsStatus } from '@/components/ui/CodeSlots';

export interface VerifyYourselfModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  actionName?: string;
  presetCode?: string;
  onVerify?: (code: string) => Promise<boolean>;
  onSuccess: (code?: string) => void;
  onCancel: () => void;
}

export default function VerifyYourselfModal({
  isOpen,
  title = 'Verify Yourself',
  description = 'To confirm this sensitive system operation, please enter the 6-digit security code sent to admin@fobign.com.',
  actionName = 'Critical Operation',
  presetCode,
  onVerify,
  onSuccess,
  onCancel,
}: VerifyYourselfModalProps) {
  const [expectedCode, setExpectedCode] = useState(presetCode || '');
  const [status, setStatus] = useState<CodeSlotsStatus>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (presetCode) {
        setExpectedCode(presetCode);
      } else {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        setExpectedCode(newCode);
      }
      setStatus('idle');
    }
  }, [isOpen, presetCode]);

  if (!isOpen) return null;

  const handleComplete = async (code: string) => {
    if (onVerify) {
      try {
        const ok = await onVerify(code);
        if (ok) {
          setStatus('success');
          setTimeout(() => {
            onSuccess(code);
          }, 500);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
      return;
    }

    if (code === expectedCode) {
      setStatus('success');
      setTimeout(() => {
        onSuccess(code);
      }, 500);
    } else {
      setStatus('error');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(expectedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-['Nunito',sans-serif]">
      <div className="bg-[#171719] border border-[#2E2E32] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                {actionName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-[#80858e] hover:text-white p-1 rounded-lg hover:bg-[#252528] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#9ca3af] leading-relaxed">
          {description}
        </p>

        {/* CodeSlots Component */}
        <div className="flex flex-col items-center justify-center py-3 space-y-3">
          <CodeSlots
            length={6}
            status={status}
            onChange={() => {
              if (status !== 'idle') setStatus('idle');
            }}
            onComplete={handleComplete}
            accentColor="#ffffff"
            inkColor="#ffffff"
            slotColor="#242428"
            digitColor="#000000"
            dangerColor="#ef4444"
            slotSize={46}
            gap={8}
            radius={12}
            autoFocus={true}
          />

          {status === 'error' && (
            <p className="text-xs text-rose-400 font-semibold animate-shake">
              Incorrect verification code. Please try again.
            </p>
          )}
        </div>

        {/* Dev OTP Helper Box */}
        <div className="p-3 rounded-xl bg-[#121214] border border-[#252528] flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-[#80858e]">Security OTP (Simulated / Email)</div>
            <div className="font-mono text-sm font-bold text-white tracking-widest">{expectedCode}</div>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-2.5 py-1 rounded-lg bg-[#252528] hover:bg-white hover:text-black text-[#9ca3af] transition-colors flex items-center gap-1.5 font-semibold text-[11px] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy OTP'}</span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#252528]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
