'use client';

import React from 'react';
import Avatar from 'boring-avatars';

interface BoringAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const MONOCHROME_PALETTE = ['#151517', '#27272A', '#3F3F46', '#71717A', '#D4D4D8'];

export default function BoringAvatar({ name, size = 40, className = '' }: BoringAvatarProps) {
  const safeName = (name && name.trim()) ? name.trim() : 'fobign-user';

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden border border-[#2E2E32] ${className}`}
      style={{ width: size, height: size }}
    >
      <Avatar
        size={size}
        name={safeName}
        variant="marble"
        colors={MONOCHROME_PALETTE}
      />
    </div>
  );
}
