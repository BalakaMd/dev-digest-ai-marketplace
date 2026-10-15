import { navigate, searchHref } from '../lib/router';
import { countByKind, topKeywords } from '../lib/search';
import { KINDS, type Catalog, type Kind } from '../lib/types';
import { KindDot, kindLabel } from '../components/common';
import { t } from '../i18n';

export function Home({ catalog }: { catalog: Catalog }) {
  const { entries, releases, meta } = catalog;
  const counts = countByKind(entries);
  const kinds = KINDS.filter((k) => counts[k] > 0);
  const chips = topKeywords(entries, 7);

  return (
    <main className="page page-home">
      <section className="hero">
        <div className="eyebrow">{t('home.eyebrow')}</div>
        <h1>{t('home.title')}</h1>
        <p className="lead">{t('home.subtitle')}</p>
        <div className="search-box search-box-lg">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
            onChange={(e) => navigate(searchHref({ q: e.target.value }))}
          />
        </div>
        <div className="chips">
          {chips.map((k) => (
            <a key={k} className="chip" href={searchHref({ keywords: [k] })}>#{k}</a>
          ))}
        </div>
      </section>

      {entries.length === 0 ? (
        <section className="empty">
          <h2>{t('home.empty.title')}</h2>
          <p>{t('home.empty.text')}</p>
          <div className="row center">
            <a className="btn btn-primary" href="#/getting-started">{t('home.empty.start')}</a>
            {meta.repoUrl && (
              <a className="btn" href={`${meta.repoUrl}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer">
                {t('home.empty.contributing')}
              </a>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="stats">
            {kinds.map((k: Kind) => (
              <a key={k} className="stat" href={searchHref({ kinds: [k] })}>
                <div className="stat-n mono">{counts[k]}</div>
                <div className="stat-l">{kindLabel(k, counts[k])}</div>
              </a>
            ))}
          </section>

          <section className="block">
            <div className="block-head">
              <h2>{t('home.latestReleases')}</h2>
              <a className="small dim" href="#/whats-new">{t('home.allReleases')}</a>
            </div>
            <div className="stack">
              {releases.slice(0, 4).map((r) => (
                <a key={`${r.plugin}@${r.version}`} className="release" href={`#/plugin/${encodeURIComponent(r.plugin)}`}>
                  <span className="badge mono" style={{ ['--k' as string]: 'var(--kind-plugin)' }}>v{r.version}</span>
                  <span className="release-main">
                    <span className="release-name">{r.displayName}</span>
                    <span className="release-sum">{r.summary}</span>
                  </span>
                  <span className="faint mono small">{r.date ?? t('whatsNew.unreleased')}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="block">
            <h2>{t('home.browseByKind')}</h2>
            <div className="row wrap">
              {kinds.map((k) => (
                <a key={k} className="kind-btn" href={searchHref({ kinds: [k] })}>
                  <KindDot kind={k} />
                  <span>{kindLabel(k, counts[k])}</span>
                  <span className="faint mono small">{counts[k]}</span>
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
