import { useEffect, useMemo, useRef, useState } from 'react';
import { artifactHref, navigate, pluginHref } from '../lib/router';
import type { Searcher } from '../lib/search';
import type { Entry } from '../lib/types';
import { KindDot } from './common';
import { t } from '../i18n';

export function Palette({ searcher, onClose }: { searcher: Searcher; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searcher.quick(query, 8), [searcher, query]);

  useEffect(() => input.current?.focus(), []);
  useEffect(() => setActive(0), [query]);

  const open = (entry: Entry) => {
    navigate(entry.kind === 'plugin' ? pluginHref(entry.name) : artifactHref(entry.id));
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      open(results[active]);
    }
  };

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div className="palette" role="dialog" aria-modal="true" aria-label={t('palette.placeholder')} onClick={(e) => e.stopPropagation()}>
        <div className="palette-head">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder={t('palette.placeholder')}
            aria-label={t('palette.placeholder')}
          />
          <button type="button" className="kbd" onClick={onClose} aria-label={t('palette.close')}>{t('palette.esc')}</button>
        </div>
        <div className="palette-list">
          {results.map((entry, i) => (
            <button
              type="button"
              key={entry.id}
              className={`palette-item${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => open(entry)}
            >
              <KindDot kind={entry.kind} />
              <span className="palette-name">
                {entry.displayName}
                {entry.kind !== 'plugin' && <span className="faint"> · {entry.plugin}</span>}
              </span>
              <span className="faint mono small">{t(`kind.${entry.kind}.one`)}</span>
            </button>
          ))}
          {results.length === 0 && <div className="palette-empty">{t('palette.empty')}</div>}
        </div>
      </div>
    </div>
  );
}
