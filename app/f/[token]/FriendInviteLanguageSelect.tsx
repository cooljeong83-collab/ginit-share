'use client';

import { FRIEND_INVITE_LANGUAGE_OPTIONS, type FriendInviteLocale } from '@/lib/friend-invite-i18n';
import { homeLanguageSelectAria } from '@/lib/home-i18n';
import type { ChangeEvent } from 'react';

import styles from './friend-invite.module.css';

type FriendInviteLanguageSelectProps = {
  locale: FriendInviteLocale;
  onLocaleChange: (locale: FriendInviteLocale) => void;
  onIntro: boolean;
};

export default function FriendInviteLanguageSelect({
  locale,
  onLocaleChange,
  onIntro,
}: FriendInviteLanguageSelectProps) {
  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (FRIEND_INVITE_LANGUAGE_OPTIONS.some((o) => o.locale === next)) {
      onLocaleChange(next as FriendInviteLocale);
    }
  };

  return (
    <div
      className={`${styles.langPicker} ${onIntro ? styles.langPickerOnIntro : styles.langPickerOnDark}`}>
      <select
        className={styles.langSelect}
        value={locale}
        aria-label={homeLanguageSelectAria(locale)}
        onChange={onChange}>
        {FRIEND_INVITE_LANGUAGE_OPTIONS.map(({ locale: optLocale, label }) => (
          <option key={optLocale} value={optLocale}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
