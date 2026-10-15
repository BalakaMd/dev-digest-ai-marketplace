import { pluginHref } from '../lib/router';
import { useText } from '../lib/data';
import { linkBaseFor } from '../lib/markdown';
import type { Catalog } from '../lib/types';
import { CommandLine, CopyButton, KindBadge, Markdown } from '../components/common';
import { t } from '../i18n';

export function ArtifactDetail({ catalog, id, onCopied }: { catalog: Catalog; id: string; onCopied: () => void }) {
  const entry = catalog.entries.find((e) => e.id === id && e.kind !== 'plugin');
  const text = useText(entry?.body);
  if (!entry) {
    return (
      <main className="page page-narrow">
        <div className="crumbs"><a href="#/search">{t('artifact.catalog')}</a></div>
        <div className="empty"><p>{t('artifact.notFound', { id })}</p></div>
      </main>
    );
  }
  const parent = catalog.entries.find((e) => e.kind === 'plugin' && e.name === entry.plugin);

  return (
    <main className="page page-artifact">
      <div className="crumbs">
        <a href="#/search">{t('artifact.catalog')}</a>
        <span className="faint"> / </span>
        <a href={pluginHref(entry.plugin)}>{parent?.displayName ?? entry.plugin}</a>
        <span className="faint"> / {entry.name}</span>
      </div>
      <div className="row wrap">
        <KindBadge kind={entry.kind} />
        <h1 className="h1-sm2">{entry.displayName}</h1>
        {entry.invocation && <span className="invocation mono">{entry.invocation}</span>}
      </div>
      <p className="dim lead-sm">{entry.description}</p>

      {entry.tools.length > 0 && (
        <div className="tools">
          <div className="label">{t('artifact.tools')}</div>
          <div className="row wrap tight">
            {entry.tools.map((tool) => <span key={tool} className="tool mono">{tool}</span>)}
          </div>
        </div>
      )}

      <div className="install-row">
        <CommandLine>{entry.installText}</CommandLine>
        <CopyButton text={entry.installText} label={t('card.copyInstall')} doneLabel={t('card.copied')} onCopied={onCopied} className="btn btn-lg btn-primary" />
      </div>

      <section>
        <h2 className="h2-sm">{t('artifact.documentation')}</h2>
        <div className="panel">
          {!text || text.status === 'loading' ? <p className="dim">{t('app.loadingDoc')}</p>
            : text.status === 'error' ? <p className="error-text">{text.message}</p>
            : text.value.trim() ? <Markdown source={text.value} linkBase={linkBaseFor(entry.kind, entry.githubUrl)} />
            : <p className="dim">{t('artifact.noBody')}</p>}
        </div>
      </section>
    </main>
  );
}
