import { artifactHref, pluginHref } from '../lib/router';
import { useText } from '../lib/data';
import { linkBaseFor } from '../lib/markdown';
import { COMPONENT_KINDS, type Catalog } from '../lib/types';
import { BackLink, CommandLine, CopyButton, KindDot, Markdown, kindLabel } from '../components/common';
import { t } from '../i18n';

function Doc({ path, linkBase, emptyKey }: { path: string | null | undefined; linkBase: string | null; emptyKey?: 'plugin.noReadme' }) {
  const text = useText(path);
  if (!text) return emptyKey ? <p className="dim">{t(emptyKey)}</p> : null;
  if (text.status === 'loading') return <p className="dim">{t('app.loadingDoc')}</p>;
  if (text.status === 'error') return <p className="error-text">{text.message}</p>;
  return text.value.trim() ? <Markdown source={text.value} linkBase={linkBase} /> : emptyKey ? <p className="dim">{t(emptyKey)}</p> : null;
}

export function PluginDetail({ catalog, name, onCopied }: { catalog: Catalog; name: string; onCopied: () => void }) {
  const entry = catalog.entries.find((e) => e.kind === 'plugin' && e.name === name);
  if (!entry) {
    return (
      <main className="page page-narrow">
        <BackLink href="#/search">{t('plugin.back')}</BackLink>
        <div className="empty"><p>{t('plugin.notFound', { name })}</p></div>
      </main>
    );
  }
  const components = COMPONENT_KINDS
    .map((kind) => ({ kind, items: catalog.entries.filter((e) => e.plugin === entry.name && e.kind === kind) }))
    .filter((g) => g.items.length > 0);
  const linkBase = linkBaseFor('plugin', entry.githubUrl);
  const releases = catalog.releases.filter((r) => r.plugin === entry.name);
  const known = new Set(catalog.entries.filter((e) => e.kind === 'plugin').map((e) => e.name));

  return (
    <main className="page page-plugin">
      <BackLink href="#/search">{t('plugin.back')}</BackLink>
      <div className="detail-head">
        <div className="plugin-mark" aria-hidden="true">◆</div>
        <div className="detail-main">
          <div className="row wrap">
            <h1 className="h1-md">{entry.displayName}</h1>
            {entry.version && <span className="badge mono" style={{ ['--k' as string]: 'var(--kind-plugin)' }}>v{entry.version}</span>}
            {entry.compatibility && <span className="badge mono" style={{ ['--k' as string]: 'var(--kind-skill)' }}>✓ {entry.compatibility}</span>}
          </div>
          <p className="dim lead-sm">{entry.description}</p>
          <div className="faint mono small">
            {entry.author ?? t('plugin.authorUnknown')} · {entry.updated ? t('plugin.updated', { date: entry.updated }) : t('plugin.updatedUnknown')}
          </div>
        </div>
      </div>

      <div className="install-row">
        <CommandLine>{entry.installText}</CommandLine>
        <CopyButton text={entry.installText} label={t('card.copyInstall')} doneLabel={t('card.copied')} onCopied={onCopied} className="btn btn-lg btn-primary" />
        {entry.githubUrl && (
          <a className="btn btn-lg" href={entry.githubUrl} target="_blank" rel="noopener noreferrer">{t('plugin.viewOnGithub')}</a>
        )}
      </div>

      <section className="block">
        <h2 className="h2-sm">{t('plugin.components')}</h2>
        <div className="stack-lg">
          {components.map((g) => (
            <div key={g.kind}>
              <div className="group-head">
                <KindDot kind={g.kind} />
                <span className="label">{kindLabel(g.kind, g.items.length)}</span>
                <span className="faint mono small">{g.items.length}</span>
              </div>
              <div className="tiles">
                {g.items.map((item) => (
                  <a key={item.id} className="tile" href={artifactHref(item.id)}>
                    <div className="tile-top">
                      <span className="tile-name">{item.displayName}</span>
                      <span className="accent mono small ellipsis">{item.invocation}</span>
                    </div>
                    <div className="tile-desc dim small">{item.description}</div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {(entry.dependencies?.length ?? 0) > 0 && (
        <section className="block">
          <h2 className="h2-sm">{t('plugin.dependencies')}</h2>
          <div className="row wrap">
            {entry.dependencies!.map((d) => {
              const label = d.range ? `${d.name} ${d.range}` : d.name;
              return known.has(d.name)
                ? <a key={d.name} className="dep mono" href={pluginHref(d.name)}>{label} ↗</a>
                : <span key={d.name} className="dep mono">{label}</span>;
            })}
          </div>
        </section>
      )}

      {(entry.dependents?.length ?? 0) > 0 && (
        <section className="block">
          <h2 className="h2-sm">{t('plugin.dependents')}</h2>
          <div className="row wrap">
            {entry.dependents!.map((d) => <a key={d} className="dep mono" href={pluginHref(d)}>{d} ↗</a>)}
          </div>
        </section>
      )}

      <section className="block">
        <h2 className="h2-sm">{t('plugin.readme')}</h2>
        <div className="panel"><Doc path={entry.body} linkBase={linkBase} emptyKey="plugin.noReadme" /></div>
      </section>

      {entry.compatibilityDoc && (
        <section className="block">
          <h2 className="h2-sm">{t('plugin.compatibility')}</h2>
          <div className="panel"><Doc path={entry.compatibilityDoc} linkBase={linkBase} /></div>
        </section>
      )}

      <section className="block">
        <h2 className="h2-sm">{t('plugin.changelog')}</h2>
        {releases.length === 0 ? <p className="dim">{t('plugin.noChangelog')}</p> : (
          <div className="stack">
            {releases.map((r) => (
              <div key={r.version} className="log">
                <div className="row">
                  <span className="mono strong plugin-color">v{r.version}</span>
                  <span className="faint small">{r.date ?? t('plugin.unreleased')}</span>
                </div>
                <div className="dim small">{r.summary}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
