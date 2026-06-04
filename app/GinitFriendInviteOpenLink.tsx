'use client';

import { openGinitAppForFriendInvite, resolveFriendInviteDeepLink } from '@/lib/ginit-app-open';
import type { MouseEvent, ReactNode } from 'react';

type GinitFriendInviteOpenLinkProps = {
  className?: string;
  friendInviteToken: string;
  children: ReactNode;
};

export default function GinitFriendInviteOpenLink({
  className,
  friendInviteToken,
  children,
}: GinitFriendInviteOpenLinkProps) {
  const href = resolveFriendInviteDeepLink(friendInviteToken);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openGinitAppForFriendInvite(friendInviteToken);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
