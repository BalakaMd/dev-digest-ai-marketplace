import { navigate, searchHref } from '../lib/router';
import type { Theme } from '../lib/theme';
import { t } from '../i18n';

interface Props {
  query: string;
  theme: Theme;
  repoUrl: string | null;
  marketplace: string;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
}

export function Header({ query, theme, repoUrl, marketplace, onToggleTheme, onOpenPalette }: Props) {
  return (
    <header className="header">
      <a className="brand" href="#/">
        <span className="brand-mark" aria-hidden="true">◆</span>
        <span className="brand-name">{t('app.brand')}</span>
        <span className="brand-tag">{marketplace}</span>
      </a>
      <div className="search-box header-search">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          placeholder={t('header.searchPlaceholder')}
          aria-label={t('header.searchPlaceholder')}
          onChange={(e) => navigate(searchHref({ q: e.target.value }), window.location.hash.startsWith('#/search'))}
        />
      </div>
      <button type="button" className="icon-btn mono" onClick={onOpenPalette} aria-label={t('header.paletteLabel')}>
        {t('header.paletteHint')}
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')}
      >
        {theme === 'dark' ? '☾' : '☀'}
      </button>
      {repoUrl && (
        <a className="header-link" href={repoUrl} target="_blank" rel="noopener noreferrer">
          {t('header.github')}
        </a>
      )}
    </header>
  );
}
