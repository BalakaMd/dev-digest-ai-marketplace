export type Kind = 'plugin' | 'skill' | 'agent' | 'command' | 'hook' | 'mcp';

export const KINDS: Kind[] = ['plugin', 'skill', 'agent', 'command', 'hook', 'mcp'];
export const COMPONENT_KINDS: Kind[] = ['skill', 'agent', 'command', 'hook', 'mcp'];

export interface Dependency {
  name: string;
  range: string | null;
}

export interface ChangelogItem {
  version: string;
  date: string | null;
  summary: string;
}

export interface Entry {
  id: string;
  kind: Kind;
  name: string;
  displayName: string;
  description: string;
  plugin: string;
  keywords: string[];
  author: string | null;
  version: string | null;
  updated: string | null;
  installText: string;
  invocation: string;
  tools: string[];
  githubUrl: string | null;
  bodyText: string;
  body: string;
  // plugin entries only
  compatibilityDoc?: string | null;
  compatibility?: string | null;
  dependencies?: Dependency[];
  dependents?: string[];
  counts?: Record<string, number>;
  changelog?: ChangelogItem[];
}

export interface CatalogMeta {
  marketplace: string;
  repoUrl: string | null;
  marketplaceAddCommand: string | null;
  generatedAt: string;
  commit: string | null;
}

export interface Release {
  plugin: string;
  displayName: string;
  version: string;
  date: string | null;
  summary: string;
  notes: string;
}

export interface Catalog {
  meta: CatalogMeta;
  entries: Entry[];
  releases: Release[];
}
