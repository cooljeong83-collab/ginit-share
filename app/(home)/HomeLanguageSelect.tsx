'use client';

import { useRouter } from 'next/navigation';
import type { ChangeEvent } from 'react';

import {
  HOME_LANGUAGE_OPTIONS,
  homeCanonicalPath,
  homeLanguageSelectAria,
  type HomeLocale,
} from '@/lib/home-i18n';
import { useHomeLocale } from '@/lib/use-home-locale';

import styles from './page.module.css';

export default function HomeLanguageSelect() {
  const router = useRouter();
  const { locale } = useHomeLocale();

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as HomeLocale;
    router.push(homeCanonicalPath(next));
  };

  return (
    <div className={styles.langPicker}>
      <select
        className={styles.langSelect}
        value={locale}
        aria-label={homeLanguageSelectAria(locale)}
        onChange={onChange}>
        {HOME_LANGUAGE_OPTIONS.map(({ locale: optLocale, label }) => (
          <option key={optLocale} value={optLocale}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
