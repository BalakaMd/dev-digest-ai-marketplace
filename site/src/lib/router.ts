import { useEffect, useState } from 'react';
import type { Kind } from './types';

export type SortKey = 'relevance' | 'name' | 'updated';

export interface SearchParams {
  q: string;
  kinds: Kind[];
  keywords: string[];
  author: string | null;
  sort: SortKey;
}

export type Route =
  | { name: 'home' }
  | { name: 'search'; params: SearchParams }
  | { name: 'plugin'; plugin: string }
  | { name: 'artifact'; id: string }
  | { name: 'whats-new' }
  | { name: 'getting-started' }
  | { name: 'not-found' };

export const emptySearch: SearchParams = { q: '', kinds: [], keywords: [], author: null, sort: 'relevance' };

const SORTS: SortKey[] = ['relevance', 'name', 'updated'];

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const decode = (s: string) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  if (parts.length === 0) return { name: 'home' };
  switch (parts[0]) {
    case 'search': {
      const sp = new URLSearchParams(query);
      const list = (key: string) => (sp.get(key) ?? '').split(',').filter(Boolean);
      const sort = sp.get('sort') as SortKey | null;
      return {
        name: 'search',
        params: {
          q: sp.get('q') ?? '',
          kinds: list('kind') as Kind[],
          keywords: list('kw'),
          author: sp.get('author') || null,
          sort: sort && SORTS.includes(sort) ? sort : 'relevance',
        },
      };
    }
    case 'plugin':
      return parts[1] ? { name: 'plugin', plugin: decode(parts[1]) } : { name: 'not-found' };
    case 'artifact':
      return parts[1] ? { name: 'artifact', id: decode(parts.slice(1).join('/')) } : { name: 'not-found' };
    case 'whats-new':
      return { name: 'whats-new' };
    case 'getting-started':
      return { name: 'getting-started' };
    default:
      return { name: 'not-found' };
  }
}

export function searchHref(params: Partial<SearchParams> = {}): string {
  const p = { ...emptySearch, ...params };
  const sp = new URLSearchParams();
  if (p.q) sp.set('q', p.q);
  if (p.kinds.length) sp.set('kind', p.kinds.join(','));
  if (p.keywords.length) sp.set('kw', p.keywords.join(','));
  if (p.author) sp.set('author', p.author);
  if (p.sort !== 'relevance') sp.set('sort', p.sort);
  const qs = sp.toString();
  return `#/search${qs ? `?${qs}` : ''}`;
}

export const pluginHref = (name: string) => `#/plugin/${encodeURIComponent(name)}`;
export const artifactHref = (id: string) => `#/artifact/${encodeURIComponent(id)}`;

/** Moves to a hash route. `replace` avoids a history entry per keystroke while typing. */
export function navigate(href: string, replace = false): void {
  if (replace) {
    history.replaceState(null, '', href);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = href.replace(/^#/, '');
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
