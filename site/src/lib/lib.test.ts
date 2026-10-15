import { describe, expect, it } from 'vitest';
import { t, plural } from '../i18n';
import { en } from '../i18n/en';
import { linkBaseFor, renderMarkdown } from './markdown';
import { parseRoute, searchHref } from './router';
import { createSearcher } from './search';
import type { Entry } from './types';

const entry = (over: Partial<Entry>): Entry => ({
  id: 'skill:p/x', kind: 'skill', name: 'x', displayName: 'X', description: '', plugin: 'p', keywords: [], author: 'Team',
  version: '1.0.0', updated: '2026-01-01', installText: '', invocation: '', tools: [], githubUrl: null, bodyText: '', body: '', ...over,
});

describe('router', () => {
  it('parses every route', () => {
    expect(parseRoute('')).toEqual({ name: 'home' });
    expect(parseRoute('#/plugin/sdd-engineering')).toEqual({ name: 'plugin', plugin: 'sdd-engineering' });
    expect(parseRoute('#/artifact/skill%3Ap%2Fx')).toEqual({ name: 'artifact', id: 'skill:p/x' });
    expect(parseRoute('#/whats-new')).toEqual({ name: 'whats-new' });
    expect(parseRoute('#/nope')).toEqual({ name: 'not-found' });
  });

  it('round-trips search parameters', () => {
    const href = searchHref({ q: 'react', kinds: ['skill', 'agent'], keywords: ['a'], author: 'Team', sort: 'name' });
    const route = parseRoute(href);
    expect(route).toEqual({ name: 'search', params: { q: 'react', kinds: ['skill', 'agent'], keywords: ['a'], author: 'Team', sort: 'name' } });
  });

  it('falls back to relevance for an unknown sort', () => {
    const route = parseRoute('#/search?sort=bogus');
    expect(route.name === 'search' && route.params.sort).toBe('relevance');
  });
});

describe('search', () => {
  const entries = [
    entry({ id: 'skill:p/zod', name: 'zod', displayName: 'Zod', description: 'Schema validation', keywords: ['validation'] }),
    entry({ id: 'agent:p/rev', kind: 'agent', name: 'rev', displayName: 'Reviewer', description: 'Reviews', bodyText: 'unique zebra phrase', author: 'Other' }),
  ];
  const searcher = createSearcher(entries);
  const params = { q: '', kinds: [], keywords: [], author: null, sort: 'relevance' as const };

  it('finds a word that only occurs in a body', () => {
    expect(searcher.search({ ...params, q: 'zebra' }).map((e) => e.id)).toEqual(['agent:p/rev']);
  });
  it('matches prefixes', () => {
    expect(searcher.search({ ...params, q: 'valid' }).map((e) => e.id)).toEqual(['skill:p/zod']);
  });
  it('filters by kind and author', () => {
    expect(searcher.search({ ...params, kinds: ['agent'] })).toHaveLength(1);
    expect(searcher.search({ ...params, author: 'Team' }).map((e) => e.id)).toEqual(['skill:p/zod']);
  });
  it('lists everything for an empty query', () => {
    expect(searcher.search(params)).toHaveLength(2);
  });
});

describe('i18n', () => {
  it('fills placeholders and picks plurals', () => {
    expect(t('card.artifactMeta', { plugin: 'p', author: 'a' })).toBe('p · a');
    expect(plural('search.count', 1)).toBe('1 artifact');
    expect(plural('search.count', 3)).toBe('3 artifacts');
  });
  it('has a plural pair for every kind', () => {
    for (const kind of ['plugin', 'skill', 'agent', 'command', 'hook', 'mcp']) {
      expect(en).toHaveProperty([`kind.${kind}.one`]);
      expect(en).toHaveProperty([`kind.${kind}.other`]);
    }
  });
});

describe('markdown', () => {
  it('removes scripts and event handlers', () => {
    const html = renderMarkdown('<script>alert(1)</script><img src=x onerror=alert(1)>text', null);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
  });
  it('resolves relative links against the GitHub base and opens them safely', () => {
    const html = renderMarkdown('[c](CHANGELOG.md)', 'https://github.com/o/r/blob/main/plugins/p/');
    expect(html).toContain('href="https://github.com/o/r/blob/main/plugins/p/CHANGELOG.md"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('derives link bases per kind', () => {
    expect(linkBaseFor('skill', 'https://github.com/o/r/tree/main/plugins/p/skills/x')).toBe('https://github.com/o/r/blob/main/plugins/p/skills/x/');
    expect(linkBaseFor('agent', 'https://github.com/o/r/tree/main/plugins/p/agents/a.md')).toBe('https://github.com/o/r/blob/main/plugins/p/agents/');
  });
});
