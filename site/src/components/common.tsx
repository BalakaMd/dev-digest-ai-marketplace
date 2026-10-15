import { useEffect, useRef, useState, type ReactNode } from 'react';
import { copyText } from '../lib/clipboard';
import { renderMarkdown } from '../lib/markdown';
import { t, plural } from '../i18n';
import type { Kind } from '../lib/types';

export function KindBadge({ kind }: { kind: Kind }) {
  return (
    <span className="badge" style={{ ['--k' as string]: `var(--kind-${kind})` }}>
      {t(`kind.${kind}.one`)}
    </span>
  );
}

export function KindDot({ kind }: { kind: Kind }) {
  return <span className="dot" style={{ background: `var(--kind-${kind})` }} aria-hidden="true" />;
}

export function kindLabel(kind: Kind, n: number): string {
  return plural(`kind.${kind}`, n);
}

/** A button that copies `text` and tells the parent so a toast can show. */
export function CopyButton({
  text, label, doneLabel, onCopied, className = 'btn',
}: { text: string; label: string; doneLabel: string; onCopied: () => void; className?: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const click = async () => {
    if (await copyText(text)) {
      setDone(true);
      onCopied();
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 2000);
    }
  };
  return (
    <button type="button" className={`${className}${done ? ' is-done' : ''}`} onClick={click}>
      {done ? doneLabel : label}
    </button>
  );
}

export function CommandLine({ children }: { children: ReactNode }) {
  return (
    <div className="cmd">
      <span className="cmd-prompt" aria-hidden="true">$</span>
      <code className="cmd-text">{children}</code>
    </div>
  );
}

export function Markdown({ source, linkBase }: { source: string; linkBase: string | null }) {
  const html = renderMarkdown(source, linkBase);
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="back" href={href}>{children}</a>;
}
