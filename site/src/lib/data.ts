import { useEffect, useState } from 'react';
import type { Catalog, CatalogMeta, Entry, Release } from './types';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return (await response.json()) as T;
}

export async function loadCatalog(): Promise<Catalog> {
  const [index, releases] = await Promise.all([
    getJson<{ meta: CatalogMeta; entries: Entry[] }>('index.json'),
    getJson<Release[]>('releases.json'),
  ]);
  return { meta: index.meta, entries: index.entries, releases };
}

export type Loadable<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; value: T };

export function useCatalog(): Loadable<Catalog> {
  const [state, setState] = useState<Loadable<Catalog>>({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    loadCatalog().then(
      (value) => alive && setState({ status: 'ready', value }),
      (error: unknown) => alive && setState({ status: 'error', message: error instanceof Error ? error.message : String(error) }),
    );
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

/** Fetches a Markdown body lazily; `null` path means there is none. */
export function useText(path: string | null | undefined): Loadable<string> | null {
  const [state, setState] = useState<Loadable<string> | null>(path ? { status: 'loading' } : null);
  useEffect(() => {
    if (!path) {
      setState(null);
      return;
    }
    let alive = true;
    setState({ status: 'loading' });
    fetch(path)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${path}: HTTP ${r.status}`))))
      .then(
        (value) => alive && setState({ status: 'ready', value }),
        (error: unknown) => alive && setState({ status: 'error', message: error instanceof Error ? error.message : String(error) }),
      );
    return () => {
      alive = false;
    };
  }, [path]);
  return state;
}
