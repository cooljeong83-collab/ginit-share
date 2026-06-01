import type { SVGProps } from 'react';

import type { OnboardingIconId } from '@/lib/home-i18n';

function base(props: SVGProps<SVGSVGElement>) {
  return {
    width: 48,
    height: 48,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };
}

export function OnboardingIcon({
  id,
  className,
}: {
  id: OnboardingIconId;
  className?: string;
}) {
  const p = { className };

  switch (id) {
    case 'search':
      return (
        <svg {...base(p)}>
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16l4.5 4.5" />
        </svg>
      );
    case 'schedule':
      return (
        <svg {...base(p)}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
          <path d="M9 14.5l2 2 4-4.5" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...base(p)}>
          <path d="M5 6.5a3 3 0 013-3h8a3 3 0 013 3v5a3 3 0 01-3 3h-5l-4.5 3.5V14.5a3 3 0 01-3-3v-5z" />
          <circle cx="9" cy="9.5" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="12" cy="9.5" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="15" cy="9.5" r="0.85" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'arrival':
      return (
        <svg {...base(p)}>
          <path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" />
          <circle cx="12" cy="11" r="2.25" />
        </svg>
      );
    case 'receipt':
      return (
        <svg {...base(p)}>
          <path d="M7 4h10a2 2 0 012 2v14l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5V6a2 2 0 012-2z" />
          <path d="M9 9h6M9 12.5h6M9 16h4" />
        </svg>
      );
    case 'review':
      return (
        <svg {...base(p)}>
          <circle cx="9" cy="9" r="2.75" />
          <circle cx="16.5" cy="10" r="2.25" />
          <path d="M4.5 19c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M13.5 19c0-1.8 1.4-3.2 3-3.5" />
        </svg>
      );
    case 'global':
      return (
        <svg {...base(p)}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
      );
    case 'link':
      return (
        <svg {...base(p)}>
          <path d="M10 14a4 4 0 005.7 0l2.3-2.3a4 4 0 00-5.7-5.7L11 7" />
          <path d="M14 10a4 4 0 00-5.7 0L6 12.3a4 4 0 005.7 5.7L13 17" />
        </svg>
      );
    case 'ai':
      return (
        <svg {...base(p)}>
          <path d="M12 3l1.4 4.3H18l-3.6 2.6 1.4 4.3L12 11.6 8.2 14.2l1.4-4.3L6 7.3h4.6L12 3z" />
          <path d="M5 19h14" />
        </svg>
      );
    case 'allinone':
      return (
        <svg {...base(p)}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      );
    default:
      return null;
  }
}
