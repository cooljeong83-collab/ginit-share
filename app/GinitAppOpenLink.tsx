'use client';

import { openGinitApp, resolveGinitAppDeepLink } from '@/lib/ginit-app-open';
import type { MouseEvent, ReactNode } from 'react';

type GinitAppOpenLinkProps = {
  className?: string;
  meetingId?: string | null;
  shareToken?: string | null;
  children: ReactNode;
};

export default function GinitAppOpenLink({
  className,
  meetingId,
  shareToken,
  children,
}: GinitAppOpenLinkProps) {
  const href = resolveGinitAppDeepLink(meetingId, shareToken);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openGinitApp(meetingId, shareToken);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
