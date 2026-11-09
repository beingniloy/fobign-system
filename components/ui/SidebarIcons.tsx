import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// 0. Home: Clean solid home building icon
export function SolidHomeIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.1L2 10.5V21C2 21.55 2.45 22 3 22H9C9.55 22 10 21.55 10 21V15H14V21C14 21.55 14.45 22 15 22H21C21.55 22 22 21.55 22 21V10.5L12 2.1Z" />
    </svg>
  );
}

// 1. Usage: 3 vertical solid bars with a horizontal base line (matches active icon in image_0a585a7f.png)
export function SolidBarChartIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="10" width="3.5" height="9" rx="1" />
      <rect x="10.25" y="4" width="3.5" height="15" rx="1" />
      <rect x="16.5" y="7" width="3.5" height="12" rx="1" />
      <rect x="3" y="20" width="18" height="2" rx="1" />
    </svg>
  );
}

// 2. API Keys: Magnifying glass with key tooth notches (matches 2nd icon in image_0a585a7f.png)
export function SolidKeySearchIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2.5a7.5 7.5 0 1 0 4.67 13.36l4.48 4.49a1.25 1.25 0 1 0 1.77-1.77l-4.48-4.48A7.5 7.5 0 0 0 10 2.5ZM5.5 10a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Zm12.75 7.25-1.5-1.5 1.25-1.25 1.5 1.5-1.25 1.25Z"
      />
    </svg>
  );
}

// 3. Top Up: Credit Card with chip / notch (matches 3rd icon in image_0a585a7f.png)
export function SolidCreditCardIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1h12a1 1 0 0 1 1 1v1.5H5V6a1 1 0 0 1 1-1Zm13 5.5H5V18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5ZM13 14a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Z"
      />
    </svg>
  );
}

// 4. Billing: Open envelope with letter sticking out (matches 4th icon in image_0a585a7f.png)
export function SolidBillingInboxIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 3a2 2 0 0 0-2 2v3h14V5a2 2 0 0 0-2-2H7Zm1 3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 9.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 9.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-9Zm9 5.25L4.5 10.5v8a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-8L12 14.75Z"
      />
    </svg>
  );
}

// 5. Docs: Folded document with horizontal lines (matches 5th icon in image_0a585a7f.png)
export function SolidDocsIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 3a2.5 2.5 0 0 0-2.5 2.5v13A2.5 2.5 0 0 0 6 21h12a2.5 2.5 0 0 0 2.5-2.5V8.5a1 1 0 0 0-.3-.71l-4.5-4.5A1 1 0 0 0 15 3H6Zm2 6a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm0 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H8Z"
      />
    </svg>
  );
}

// 6. Help: Speech bubble with ? (matches 6th icon in image_0a585a7f.png)
export function SolidHelpBubbleIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.25 2 11.5c0 2.76 1.25 5.24 3.25 6.94V21a1 1 0 0 0 1.55.83l3.05-1.93c.7.1 1.42.15 2.15.15 5.52 0 10-4.25 10-9.5S17.52 2 12 2Zm.1 6c-1.38 0-2.35.85-2.35 1.75a1 1 0 0 0 2 0c0-.18.35-.45.85-.45.5 0 .9.28.9.65 0 .42-.32.65-.95 1.05-.75.48-1.45 1.15-1.45 2.05v.2a1 1 0 1 0 2 0v-.05c.45-.35.9-.65 1.35-.95.8-.52 1.55-1.25 1.55-2.3 0-1.74-1.68-2.95-3.9-2.95Zm-.1 8.5a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z"
      />
    </svg>
  );
}

// 7. Pricing: Angled price tag with hole (matches 7th icon in image_0a585a7f.png)
export function SolidPriceTagIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.86 2.56A2 2 0 0 0 9.45 2H4a2 2 0 0 0-2 2v5.45c0 .53.21 1.04.59 1.41l10.55 10.55a2 2 0 0 0 2.83 0l6.04-6.04a2 2 0 0 0 0-2.83L10.86 2.56ZM6.5 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
      />
    </svg>
  );
}

// 8. Chat for Free: Speech bubble with 3 dots (matches 8th icon in image_0a585a7f.png)
export function SolidChatDotsIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 11.5C2 6.25 6.48 2 12 2s10 4.25 10 9.5c0 5.24-4.48 9.45-10 9.45-.75 0-1.48-.07-2.18-.19l-4.13 2.19a.8.8 0 0 1-1.18-.73v-3.78C3.12 16.66 2 14.23 2 11.5Zm6 0a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Zm4 0a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Zm4 0a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Z"
      />
    </svg>
  );
}

// 9. Exchange Rate (currency conversion $ <-> ৳)
export function SolidExchangeIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 7a1 1 0 0 1 1-1h11.09l-2.3-2.29a1 1 0 1 1 1.42-1.42l4 4a1 1 0 0 1 0 1.42l-4 4a1 1 0 0 1-1.42-1.42L16.59 8H5.5a1 1 0 0 1-1-1Zm15 10a1 1 0 0 1-1 1H7.41l2.3 2.29a1 1 0 1 1-1.42 1.42l-4-4a1 1 0 0 1 0-1.42l4-4a1 1 0 1 1 1.42 1.42L7.41 16H18.5a1 1 0 0 1 1 1Z"
      />
    </svg>
  );
}

// 10. General Settings (Sliders / Cog)
export function SolidSlidersIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 6a1 1 0 0 1 1-1h2.18a3.001 3.001 0 0 1 5.64 0H19a1 1 0 1 1 0 2h-6.18a3.001 3.001 0 0 1-5.64 0H5a1 1 0 0 1-1-1Zm15 6a1 1 0 0 0-1-1h-2.18a3.001 3.001 0 0 0-5.64 0H5a1 1 0 1 0 0 2h5.18a3.001 3.001 0 0 0 5.64 0H18a1 1 0 0 0 1-1Zm-5 6a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1Zm-2.82-1a3.001 3.001 0 0 0-5.64 0H5a1 1 0 1 0 0 2h.54a3.001 3.001 0 0 0 5.64 0Z"
      />
    </svg>
  );
}

// 11. Branding: Palette
export function SolidPaletteIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.49 2 2 6.49 2 12c0 4.96 4.04 9 9 9h1.5a3.5 3.5 0 0 0 3.5-3.5c0-.62-.17-1.2-.47-1.7-.29-.48-.48-.99-.48-1.55 0-1.24 1.01-2.25 2.25-2.25H19c2.76 0 5-2.24 5-5 0-5.51-5.37-7-12-7Zm-4.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm5.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm4.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM6.5 13a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
      />
    </svg>
  );
}

// 12. Announcement: Megaphone
export function SolidMegaphoneIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 4a1 1 0 0 1 .8.4l2.5 3.5a1 1 0 0 1 0 1.2L19.8 12.6a1 1 0 0 1-.8.4v-9Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 8A1.5 1.5 0 0 0 2 9.5v5A1.5 1.5 0 0 0 3.5 16h2.8l5.95 4.46A1.5 1.5 0 0 0 15 19.26V4.74a1.5 1.5 0 0 0-2.75-1.2L6.3 8H3.5ZM6 18v2.5a2 2 0 0 0 2 2h1a1 1 0 1 0 0-2H8v-2.5H6Z"
      />
    </svg>
  );
}

// 13. Payment Method: Wallet
export function SolidWalletIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 5a3 3 0 0 1 3-3h13a2 2 0 0 1 2 2v2.5H6a1.5 1.5 0 0 0-1.5 1.5V9H3V5Zm-1 5.5A2.5 2.5 0 0 1 4.5 8H20a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-8.5ZM16 14a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
      />
    </svg>
  );
}

// 14. Tax: Percent badge
export function SolidPercentIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8 7.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm7.29 2.21a1 1 0 0 0-1.41-1.42l-6 6a1 1 0 1 0 1.41 1.42l6-6Zm-2.29 5.29a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
      />
    </svg>
  );
}

// 15. Supabase Database: Stacked cylinders
export function SolidDatabaseIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 3.34 2 5s4.48 3 10 3 10-1.34 10-3-4.48-3-10-3Z" />
      <path d="M2 7.15V11c0 1.66 4.48 3 10 3s10-1.34 10-3V7.15c-1.92 1.15-5.63 1.85-10 1.85s-8.08-.7-10-1.85Z" />
      <path d="M2 13.15V17c0 1.66 4.48 3 10 3s10-1.34 10-3v-3.85c-1.92 1.15-5.63 1.85-10 1.85s-8.08-.7-10-1.85Z" />
    </svg>
  );
}

// 16. Users: Two solid figures
export function SolidUsersIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
      <path d="M19 14.5c1.8.8 3 2.1 3 3.5v1h-3v-1c0-1.3-.7-2.4-1.8-3.1.6-.2 1.2-.4 1.8-.4ZM17.5 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" opacity="0.7" />
    </svg>
  );
}

// 17. Roles: Shield with star
export function SolidRolesShieldIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2a1 1 0 0 1 .52.15l8 5A1 1 0 0 1 21 8v6c0 5.5-4.14 10.1-8.52 11.88a1.2 1.2 0 0 1-.96 0C7.14 24.1 3 19.5 3 14V8a1 1 0 0 1 .48-.85l8-5A1 1 0 0 1 12 2Zm0 5.25a.75.75 0 0 1 .69.46l1 2.27 2.45.24c.7.07.98.96.44 1.43l-1.84 1.63.53 2.41c.15.68-.58 1.22-1.18.86L12 15.17l-2.09 1.38c-.6.4-1.33-.14-1.18-.86l.53-2.41-1.84-1.63c-.54-.47-.26-1.36.44-1.43l2.45-.24 1-2.27a.75.75 0 0 1 .69-.46Z"
      />
    </svg>
  );
}

// 18. Tickets: Support ticket stub
export function SolidTicketIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2.5 2.5 0 0 0 0 5v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2.5 2.5 0 0 0 0-5V6Zm6 3a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1Zm0 4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H9Z"
      />
    </svg>
  );
}

// 19. Providers: Server tower
export function SolidServerIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="7" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
      <circle cx="7" cy="6.5" r="1" fill="#151517" />
      <circle cx="7" cy="17.5" r="1" fill="#151517" />
      <rect x="11" y="6" width="6" height="1.2" rx="0.6" fill="#151517" />
      <rect x="11" y="17" width="6" height="1.2" rx="0.6" fill="#151517" />
    </svg>
  );
}

// 20. Models: Layers stack
export function SolidLayersIcon({ className = '', size = 18, color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="M2 12l10 5 10-5-2-1-8 4-8-4-2 1Z" />
      <path d="M2 17l10 5 10-5-2-1-8 4-8-4-2 1Z" />
    </svg>
  );
}
