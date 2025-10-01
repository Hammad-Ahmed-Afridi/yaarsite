import React from 'react';

interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const WhatsappIcon: React.FC<SocialIconProps> = ({ size = 24, color = '#25D366', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.22 2h-.44C9.44 2 7.25 3.65 7.25 6.15c0 2.45 2.2 4.1 4.53 4.1h.44c2.33 0 4.53-1.65 4.53-4.1C16.75 3.65 14.56 2 12.22 2z" fill={color} stroke="none" />
    <path d="M12 22c-2.42 0-4.7-.6-6.7-1.7l-4.3 1.1 1.1-4.3c-1.1-2-1.7-4.3-1.7-6.7C.4 6.5 6.5.4 12 .4s11.6 6.1 11.6 11.6c0 2.42-.6 4.7-1.7 6.7l1.1 4.3-4.3-1.1c-2 1.1-4.3 1.7-6.7 1.7z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 14.5c-.5-.25-2.5-1.25-2.9-1.45s-.7-.3-.9.3-.6 1.4-.8 1.6-.4.2-.8.1-1.5-.5-1.8-1.2-.3-1.2-.2-1.6.4-.8.9-1.4.4-.9.2-1.4-.7-1.2-1.2-1.4-.8-.2-1.4-.2c-.6 0-1.2.2-1.8.8s-2.4 2.3-2.4 5.6 2.5 6.5 2.9 6.9 4.7 1.5 6.1 1.3 2.3-.9 2.7-1.5.4-1.2.3-1.4z" fill={color} stroke="none" />
  </svg>
);

export const InstagramIcon: React.FC<SocialIconProps> = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.5" y1="6.5" y2="6.5" />
  </svg>
);

export const FacebookIcon: React.FC<SocialIconProps> = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const TiktokIcon: React.FC<SocialIconProps> = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12v6a3 3 0 0 0 3 3c1.6 0 3-1.4 3-3V8.5a2.5 2.5 0 0 1 5 0V17a9 9 0 1 1-9-9h-3" />
  </svg>
);