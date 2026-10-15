import MiniSearch from 'minisearch';
import type { Entry, Kind } from './types';
import type { SearchParams } from './router';

export interface Searcher {
  search(params: SearchParams): Entry[];
  quick(query: string, limit?: number): Entry[];
}

export function createSearcher(entries: Entry[]): Searcher {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const engine = new MiniSearch<Entry>({
    fields: ['displayName', 'name', 'keywords', 'description', 'bodyText'],
    storeFields: [],
    idField: 'id',
    extractField: (doc, field) => {
      const value = (doc as unknown as Record<string, unknown>)[field];
      return Array.isArray(value) ? value.join(' ') : String(value ?? '');
    },
    searchOptions: {
      boost: { displayName: 5, name: 5, keywords: 3, description: 2, bodyText: 1 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'AND',
    },
  });
  engine.addAll(entries);

  const ranked = (query: string): { entry: Entry; score: number }[] => {
    if (!query.trim()) return entries.map((entry) => ({ entry, score: 1 }));
    return engine
      .search(query)
      .map((hit) => ({ entry: byId.get(hit.id as string)!, score: hit.score }))
      .filter((hit) => hit.entry);
  };

  return {
    search(params) {
      let list = ranked(params.q);
      if (params.kinds.length) list = list.filter((h) => params.kinds.includes(h.entry.kind));
      if (params.keywords.length) list = list.filter((h) => params.keywords.some((k) => h.entry.keywords.includes(k)));
      if (params.author) list = list.filter((h) => h.entry.author === params.author);
      list.sort((a, b) => {
        if (params.sort === 'name') return a.entry.displayName.localeCompare(b.entry.displayName);
        if (params.sort === 'updated') {
          return (b.entry.updated ?? '').localeCompare(a.entry.updated ?? '') || a.entry.displayName.localeCompare(b.entry.displayName);
        }
        return b.score - a.score || a.entry.displayName.localeCompare(b.entry.displayName);
      });
      return list.map((h) => h.entry);
    },
    quick(query, limit = 8) {
      return ranked(query).slice(0, limit).map((h) => h.entry);
    },
  };
}

export function countByKind(entries: Entry[]): Record<Kind, number> {
  const counts = { plugin: 0, skill: 0, agent: 0, command: 0, hook: 0, mcp: 0 } as Record<Kind, number>;
  for (const e of entries) counts[e.kind] += 1;
  return counts;
}

export function topKeywords(entries: Entry[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const e of entries) for (const k of e.keywords) counts.set(k, (counts.get(k) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([k]) => k);
}
