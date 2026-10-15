import { useMemo } from 'react';
import { navigate, searchHref, type SearchParams, type SortKey } from '../lib/router';
import { countByKind, type Searcher } from '../lib/search';
import { KINDS, type Catalog, type Kind } from '../lib/types';
import { Card } from '../components/Card';
import { KindDot, kindLabel } from '../components/common';
import { t, plural } from '../i18n';

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export function Search({ catalog, searcher, params, onCopied }: {
  catalog: Catalog; searcher: Searcher; params: SearchParams; onCopied: () => void;
}) {
  const { entries } = catalog;
  const results = useMemo(() => searcher.search(params), [searcher, params]);
  const counts = countByKind(entries);
  const keywords = useMemo(() => [...new Set(entries.flatMap((e) => e.keywords))].sort(), [entries]);
  const authors = useMemo(() => {
    const byAuthor = new Map<string, number>();
    for (const e of entries) if (e.author) byAuthor.set(e.author, (byAuthor.get(e.author) ?? 0) + 1);
    return [...byAuthor.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [entries]);

  const go = (patch: Partial<SearchParams>) => navigate(searchHref({ ...params, ...patch }), true);
  const clear = () => navigate(searchHref({ sort: params.sort }), true);

  return (
    <main className="page page-search">
      <aside className="filters">
        <div className="filters-head">
          <span className="label">{t('search.filters')}</span>
          <button type="button" className="link-btn" onClick={clear}>{t('search.reset')}</button>
        </div>

        <div className="facet-title">{t('search.kind')}</div>
        <div className="facet-list">
          {KINDS.filter((k) => counts[k] > 0).map((k: Kind) => (
            <button
              type="button"
              key={k}
              className={`facet${params.kinds.includes(k) ? ' is-on' : ''}`}
              aria-pressed={params.kinds.includes(k)}
              onClick={() => go({ kinds: toggle(params.kinds, k) })}
            >
              <KindDot kind={k} />
              <span className="facet-name">{kindLabel(k, 2)}</span>
              <span className="faint mono small">{counts[k]}</span>
            </button>
          ))}
        </div>

        <div className="facet-title">{t('search.keywords')}</div>
        <div className="row wrap tight">
          {keywords.map((k) => (
            <button
              type="button"
              key={k}
              className={`chip chip-sm${params.keywords.includes(k) ? ' is-on' : ''}`}
              aria-pressed={params.keywords.includes(k)}
              onClick={() => go({ keywords: toggle(params.keywords, k) })}
            >
              {k}
            </button>
          ))}
        </div>

        {authors.length > 0 && (
          <>
            <div className="facet-title">{t('search.author')}</div>
            <div className="facet-list">
              {authors.map(([author, n]) => (
                <button
                  type="button"
                  key={author}
                  className={`facet${params.author === author ? ' is-on' : ''}`}
                  aria-pressed={params.author === author}
                  onClick={() => go({ author: params.author === author ? null : author })}
                >
                  <span className="facet-name">{author}</span>
                  <span className="faint mono small">{n}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      <section>
        <div className="results-head">
          <div>
            <h1 className="h1-sm">{params.q ? t('search.headingQuery', { query: params.q }) : t('search.headingBrowse')}</h1>
            <div className="dim small">{plural('search.count', results.length)}</div>
          </div>
          <label className="sort">
            <span>{t('search.sort')}</span>
            <select value={params.sort} onChange={(e) => go({ sort: e.target.value as SortKey })}>
              <option value="relevance">{t('search.sort.relevance')}</option>
              <option value="name">{t('search.sort.name')}</option>
              <option value="updated">{t('search.sort.updated')}</option>
            </select>
          </label>
        </div>

        {results.length > 0 ? (
          <div className="grid">
            {results.map((entry) => <Card key={entry.id} entry={entry} onCopied={onCopied} />)}
          </div>
        ) : (
          <div className="empty">
            <h3>{t('search.empty.title')}</h3>
            <p>{t('search.empty.text')}</p>
            <button type="button" className="btn" onClick={clear}>{t('search.empty.reset')}</button>
          </div>
        )}
      </section>
    </main>
  );
}
