'use client';

import {
  SHARE_LANGUAGE_OPTIONS,
  shareLanguageSelectAria,
  type ShareLocale,
} from '@/lib/share-i18n';
import type { ChangeEvent } from 'react';

import styles from './friend-invite.module.css';

type FriendInviteLanguageSelectProps = {
  locale: ShareLocale;
  onLocaleChange: (locale: ShareLocale) => void;
  onIntro: boolean;
};

export default function FriendInviteLanguageSelect({
  locale,
  onLocaleChange,
  onIntro,
}: FriendInviteLanguageSelectProps) {
  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onLocaleChange(e.target.value as ShareLocale);
  };

  return (
    <div
      className={`${styles.langPicker} ${onIntro ? styles.langPickerOnIntro : styles.langPickerOnDark}`}>
      <select
        className={styles.langSelect}
        value={locale}
        aria-label={shareLanguageSelectAria(locale)}
        onChange={onChange}>
        {SHARE_LANGUAGE_OPTIONS.map(({ locale: optLocale, label }) => (
          <option key={optLocale} value={optLocale}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
