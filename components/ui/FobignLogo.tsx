'use client';

import React from 'react';

interface FobignLogoProps {
  customLogoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeText?: string;
}

export default function FobignLogo({ 
  customLogoUrl, 
  size = 'md', 
  showBadge = true,
  badgeText = 'Admin'
}: FobignLogoProps) {
  if (customLogoUrl) {
    return (
      <div className="flex items-center gap-2 select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customLogoUrl}
          alt="Fobign"
          className={
            size === 'sm'
              ? 'h-5 max-w-[120px] object-contain'
              : size === 'lg'
              ? 'h-8 max-w-[160px] object-contain'
              : 'h-6 max-w-[140px] object-contain'
          }
        />
        {showBadge && (
          <span className="text-[10px] font-semibold tracking-wide text-neutral-200 [.light_&]:text-neutral-700 bg-[#252528] [.light_&]:bg-neutral-200 border border-white/10 [.light_&]:border-neutral-300 rounded-md px-1.5 py-0.5 leading-none">
            {badgeText}
          </span>
        )}
      </div>
    );
  }

  const iconDimension = size === 'sm' ? 22 : size === 'lg' ? 30 : 26;
  const textSizeClass = size === 'sm' ? 'text-[17px]' : size === 'lg' ? 'text-[22px]' : 'text-[19px]';

  return (
    <div className="inline-flex items-center gap-2.5 select-none text-white [.light_&]:text-neutral-900 transition-colors">
      {/* Precision Engineered Dimensional AI Gateway Nexus Emblem */}
      <svg
        width={iconDimension}
        height={iconDimension}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        {/* Top Isometric Gateway Facet */}
        <path
          d="M14 2.5L25 8.8L14 15.1L3 8.8L14 2.5Z"
          fill="currentColor"
          fillOpacity="1"
        />
        {/* Left Isometric Gateway Facet */}
        <path
          d="M3 10.4L13 16.1V26.2L3 20.5V10.4Z"
          fill="currentColor"
          fillOpacity="0.75"
        />
        {/* Right Isometric Gateway Facet */}
        <path
          d="M15 16.1L25 10.4V20.5L15 26.2V16.1Z"
          fill="currentColor"
          fillOpacity="0.5"
        />
        {/* Central Core Portal Aperture */}
        <circle cx="14" cy="14" r="1.75" fill="currentColor" fillOpacity="1" />
      </svg>

      {/* Modern Wordmark — crisp text ensuring zero clipping, exact brand typography */}
      <span className={`font-black ${textSizeClass} tracking-tight leading-none text-white [.light_&]:text-neutral-900 transition-colors`}>
        fobign
      </span>

      {showBadge && (
        <span className="text-[10px] font-semibold tracking-wide text-neutral-300 [.light_&]:text-neutral-700 bg-[#252528] [.light_&]:bg-neutral-200 border border-white/10 [.light_&]:border-neutral-300 rounded-md px-1.5 py-0.5 leading-none transition-colors">
          {badgeText}
        </span>
      )}
    </div>
  );
}
