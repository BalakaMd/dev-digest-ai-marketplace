import { en, type MessageKey } from './en';

export type { MessageKey };

type Vars = Record<string, string | number>;

/** Looks up a message and fills its {placeholders}. An unknown key shows the key, never a blank. */
export function t(key: MessageKey, vars: Vars = {}): string {
  const template: string = en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
}

/** Picks the `.one` or `.other` variant of a message by count. */
export function plural(base: 'kind.plugin' | 'kind.skill' | 'kind.agent' | 'kind.command' | 'kind.hook' | 'kind.mcp' | 'search.count', n: number): string {
  const key = `${base}.${n === 1 ? 'one' : 'other'}` as MessageKey;
  return t(key, { n });
}
