import type { Catalog } from '../lib/types';
import { BackLink, CommandLine, CopyButton } from '../components/common';
import { t } from '../i18n';

export function WhatsNew({ catalog }: { catalog: Catalog }) {
  const { releases, meta } = catalog;
  return (
    <main className="page page-narrow">
      <BackLink href="#/">{t('whatsNew.back')}</BackLink>
      <div className="row between">
        <h1 className="h1-md">{t('whatsNew.title')}</h1>
        {meta.repoUrl && (
          <a className="btn btn-sm mono" href={`${meta.repoUrl}/releases`} target="_blank" rel="noopener noreferrer">
            {t('whatsNew.githubReleases')}
          </a>
        )}
      </div>
      {releases.length === 0 ? <p className="dim">{t('whatsNew.empty')}</p> : (
        <div className="stack">
          {releases.map((r) => (
            <a key={`${r.plugin}@${r.version}`} className="release release-full" href={`#/plugin/${encodeURIComponent(r.plugin)}`}>
              <div className="release-ver">
                <div className="mono strong plugin-color">v{r.version}</div>
                <div className="faint mono small">{r.date ?? t('whatsNew.unreleased')}</div>
              </div>
              <div className="release-main">
                <span className="release-name">{r.displayName}</span>
                <span className="dim small">{r.summary}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

export function GettingStarted({ catalog, onCopied }: { catalog: Catalog; onCopied: () => void }) {
  const { meta, entries } = catalog;
  const plugins = entries.filter((e) => e.kind === 'plugin');
  // Suggest the plugin that pulls in the most dependencies: it shows the whole set working together.
  const sample = [...plugins].sort((a, b) => (b.dependencies?.length ?? 0) - (a.dependencies?.length ?? 0))[0];
  const addCommand = meta.marketplaceAddCommand ?? `/plugin marketplace add ${meta.marketplace}`;
  const steps = [
    { n: 1, title: t('start.step1.title'), text: t('start.step1.text'), cmds: [addCommand] },
    { n: 2, title: t('start.step2.title'), text: t('start.step2.text'), cmds: [sample ? sample.installText : `/plugin install <plugin>@${meta.marketplace}`] },
    {
      n: 3, title: t('start.step3.title'), text: t('start.step3.text'),
      cmds: [`claude plugin marketplace update ${meta.marketplace}`, `claude plugin update ${sample?.name ?? '<plugin>'}@${meta.marketplace}`],
    },
  ];
  return (
    <main className="page page-narrow2">
      <BackLink href="#/">{t('start.back')}</BackLink>
      <h1 className="h1-lg">{t('start.title')}</h1>
      <p className="dim lead-sm">{t('start.subtitle')}</p>
      <div className="stack-lg">
        {steps.map((s) => (
          <div key={s.n} className="step">
            <div className="step-n mono">{s.n}</div>
            <div className="step-main">
              <h3>{s.title}</h3>
              <p className="dim small">{s.text}</p>
              {s.cmds.map((cmd) => (
                <div key={cmd} className="step-cmd">
                  <CommandLine>{cmd}</CommandLine>
                  <CopyButton text={cmd} label={t('start.copy')} doneLabel={t('start.copied')} onCopied={onCopied} className="btn btn-sm" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="note">
        <strong>{t('start.noteTitle')}</strong> {t('start.noteText')}
      </div>
    </main>
  );
}
