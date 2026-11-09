'use client';

import React from 'react';
import { SkeletonBox } from 'skullet/react';

interface AuthSkeletonProps {
  mode?: 'login' | 'signup';
}

export default function AuthSkeleton({ mode = 'login' }: AuthSkeletonProps) {
  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-[#0e0f11] text-[#f0f2f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Nunito',sans-serif]">
      <div className="w-full max-w-5xl bg-[#131415] rounded-3xl border border-[#232529] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[660px]">
        
        {/* LEFT COLUMN: Hero Banner Skeleton */}
        <div className="w-full md:w-1/2 relative bg-gradient-to-br from-[#0c1a2e] via-[#0d1629] to-[#0a0d14] p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#232528]">
          <div className="space-y-6 max-w-sm my-auto">
            {/* Badge Skeleton */}
            <SkeletonBox height={28} width={180} radius={999} className="bg-[#1e293b]/70 border border-cyan-500/10" />

            {/* Headline Skeleton */}
            <div className="space-y-2.5">
              <SkeletonBox height={32} width="100%" radius={12} className="bg-[#1e293b]/80" />
              <SkeletonBox height={32} width="75%" radius={12} className="bg-[#1e293b]/80" />
            </div>

            {/* Subheading Paragraph Skeleton */}
            <div className="space-y-2 pt-1">
              <SkeletonBox height={16} width="100%" radius={6} className="bg-[#1e293b]/50" />
              <SkeletonBox height={16} width="85%" radius={6} className="bg-[#1e293b]/50" />
              <SkeletonBox height={16} width="65%" radius={6} className="bg-[#1e293b]/50" />
            </div>

            {/* Bullet List Skeleton */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-3">
                <SkeletonBox height={16} width={16} radius={999} className="bg-emerald-500/20 shrink-0" />
                <SkeletonBox height={14} width={220} radius={6} className="bg-[#1e293b]/60" />
              </div>
              <div className="flex items-center gap-3">
                <SkeletonBox height={16} width={16} radius={999} className="bg-emerald-500/20 shrink-0" />
                <SkeletonBox height={14} width={250} radius={6} className="bg-[#1e293b]/60" />
              </div>
              <div className="flex items-center gap-3">
                <SkeletonBox height={16} width={16} radius={999} className="bg-emerald-500/20 shrink-0" />
                <SkeletonBox height={14} width={190} radius={6} className="bg-[#1e293b]/60" />
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-white/5">
            <SkeletonBox height={14} width={130} radius={6} className="bg-[#1e293b]/40" />
            <SkeletonBox height={14} width={110} radius={6} className="bg-[#1e293b]/40" />
          </div>
        </div>

        {/* RIGHT COLUMN: Form Skeleton */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-[#131415]">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header / Logo Skeleton */}
            <div className="flex flex-col items-center gap-3 text-center">
              <SkeletonBox height={40} width={40} radius={12} className="bg-[#252830]" />
              <SkeletonBox height={24} width={160} radius={10} className="bg-[#252830]" />
              <SkeletonBox height={14} width={240} radius={6} className="bg-[#1e2026]" />
            </div>

            {/* Social OAuth Button Skeleton */}
            {isSignup && (
              <SkeletonBox height={44} width="100%" radius={999} className="bg-[#1c1e24] border border-[#2b2d34]" />
            )}

            {/* Form Inputs Skeleton */}
            <div className="space-y-4 pt-1">
              {isSignup && (
                <SkeletonBox height={40} width="100%" radius={12} className="bg-[#18191b] border border-[#232529]" />
              )}

              <SkeletonBox height={40} width="100%" radius={12} className="bg-[#18191b] border border-[#232529]" />
              <SkeletonBox height={40} width="100%" radius={12} className="bg-[#18191b] border border-[#232529]" />

              {isSignup && (
                <>
                  <SkeletonBox height={40} width="100%" radius={12} className="bg-[#18191b] border border-[#232529]" />
                  <SkeletonBox height={40} width="100%" radius={12} className="bg-[#18191b] border border-[#232529]" />
                </>
              )}

              {/* Submit Button Skeleton */}
              <SkeletonBox height={48} width="100%" radius={999} className="bg-neutral-200/90 mt-2" />
            </div>

            {/* Footer links Skeleton */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <SkeletonBox height={14} width={150} radius={6} className="bg-[#1c1e24]" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
