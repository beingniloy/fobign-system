'use client';

import React from 'react';

interface ProviderSvglIconProps {
  providerIdOrType?: string;
  name?: string;
  className?: string;
  size?: number;
}

export default function ProviderSvglIcon({
  providerIdOrType = '',
  name = '',
  className = '',
  size = 18,
}: ProviderSvglIconProps) {
  const key = `${providerIdOrType} ${name}`.toLowerCase();

  if (key.includes('openai') || key.includes('gpt')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`}
      >
        <path d="M12 2a4 4 0 0 0-3.8 2.76A4.5 4.5 0 0 0 5 9.06 4.5 4.5 0 0 0 6.64 16 4 4 0 0 0 10 21.5a4.5 4.5 0 0 0 6.16-2.26A4 4 0 0 0 19 14.94 4.5 4.5 0 0 0 17.36 8 4 4 0 0 0 12 2z" />
        <path d="M12 7v10" />
        <path d="m8.5 9 7 4" />
        <path d="m8.5 15 7-4" />
      </svg>
    );
  }

  if (key.includes('anthropic') || key.includes('claude')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`shrink-0 ${className}`}
      >
        <path d="M17.004 3.75H13.62L8.25 18.25H11.5L12.5 15.5H16.25L17.25 18.25H20.5L17.004 3.75ZM13.4 13L14.875 9L15.35 13H13.4Z" />
        <path d="M6.996 3.75H3.62L3.5 18.25H6.75L6.996 3.75Z" />
      </svg>
    );
  }

  if (key.includes('gemini') || key.includes('google')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`shrink-0 ${className}`}
      >
        <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z" />
      </svg>
    );
  }

  if (key.includes('deepseek')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12c1.5-2 4.5-2 6 0" />
        <path d="M10 15c.5.5 1.5.5 2 0" />
      </svg>
    );
  }

  if (key.includes('groq')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`shrink-0 ${className}`}
      >
        <path d="M12 2a10 10 0 1 0 7.07 17.07l-2.83-2.83A6 6 0 1 1 12 6v-4z" />
      </svg>
    );
  }

  if (key.includes('mistral')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`shrink-0 ${className}`}
      >
        <rect x="3" y="3" width="4" height="18" rx="1" />
        <rect x="10" y="3" width="4" height="18" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    );
  }

  if (key.includes('openrouter')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`}
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    );
  }

  if (key.includes('ollama') || key.includes('vllm')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`shrink-0 ${className}`}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    );
  }

  // Default server / provider icon
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}

