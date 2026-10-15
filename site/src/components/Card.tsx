import { artifactHref, pluginHref } from '../lib/router';
import type { Entry } from '../lib/types';
import { CopyButton, KindBadge } from './common';
import { t } from '../i18n';

export function Card({ entry, onCopied }: { entry: Entry; onCopied: () => void }) {
  const href = entry.kind === 'plugin' ? pluginHref(entry.name) : artifactHref(entry.id);
  const author = entry.author ?? t('plugin.authorUnknown');
  const meta = entry.kind === 'plugin' ? t('card.pluginMeta', { author }) : t('card.artifactMeta', { plugin: entry.plugin, author });
  return (
    <article className="card">
      <div className="card-body">
        <div className="card-top">
          <KindBadge kind={entry.kind} />
          {entry.version && <span className="faint mono small">v{entry.version}</span>}
        </div>
        <a className="card-title" href={href}>{entry.displayName}</a>
        <p className="card-desc">{entry.description}</p>
        <div className="card-kw">
          {entry.keywords.slice(0, 3).map((k) => (
            <span key={k} className="faint mono small">#{k}</span>
          ))}
        </div>
      </div>
      <div className="card-foot">
        <span className="faint small ellipsis">{meta}</span>
        <div className="card-actions">
          <CopyButton text={entry.installText} label={t('card.copyInstall')} doneLabel={t('card.copied')} onCopied={onCopied} className="btn btn-sm" />
          <a className="btn btn-sm btn-primary" href={href}>{t('card.open')}</a>
        </div>
      </div>
    </article>
  );
}
