import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Palette } from './components/Palette';
import { useCatalog } from './lib/data';
import { useRoute } from './lib/router';
import { createSearcher } from './lib/search';
import { useTheme } from './lib/theme';
import type { Catalog } from './lib/types';
import { ArtifactDetail } from './screens/ArtifactDetail';
import { Home } from './screens/Home';
import { PluginDetail } from './screens/PluginDetail';
import { Search } from './screens/Search';
import { GettingStarted, WhatsNew } from './screens/Simple';
import { t } from './i18n';

function Toast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="toast" role="status">
      <span className="toast-ok" aria-hidden="true">✓</span> {t('toast.copied')}
    </div>
  );
}

function Loaded({ catalog }: { catalog: Catalog }) {
  const route = useRoute();
  const [theme, toggleTheme] = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<number>();
  const searcher = useMemo(() => createSearcher(catalog.entries), [catalog.entries]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => setPaletteOpen(false), [route]);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const onCopied = useCallback(() => {
    setToast(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 1800);
  }, []);

  let screen;
  switch (route.name) {
    case 'home': screen = <Home catalog={catalog} />; break;
    case 'search': screen = <Search catalog={catalog} searcher={searcher} params={route.params} onCopied={onCopied} />; break;
    case 'plugin': screen = <PluginDetail catalog={catalog} name={route.plugin} onCopied={onCopied} />; break;
    case 'artifact': screen = <ArtifactDetail catalog={catalog} id={route.id} onCopied={onCopied} />; break;
    case 'whats-new': screen = <WhatsNew catalog={catalog} />; break;
    case 'getting-started': screen = <GettingStarted catalog={catalog} onCopied={onCopied} />; break;
    default:
      screen = (
        <main className="page page-narrow">
          <div className="empty">
            <h1 className="h1-sm">{t('notFound.title')}</h1>
            <p>{t('notFound.text')}</p>
            <a className="btn btn-primary" href="#/">{t('notFound.home')}</a>
          </div>
        </main>
      );
  }

  return (
    <>
      <Header
        query={route.name === 'search' ? route.params.q : ''}
        theme={theme}
        repoUrl={catalog.meta.repoUrl}
        marketplace={catalog.meta.marketplace}
        onToggleTheme={toggleTheme}
        onOpenPalette={() => setPaletteOpen(true)}
      />
      {screen}
      {paletteOpen && <Palette searcher={searcher} onClose={() => setPaletteOpen(false)} />}
      <Toast visible={toast} />
    </>
  );
}

export function App() {
  const state = useCatalog();
  useEffect(() => {
    document.title = t('app.title');
  }, []);
  if (state.status === 'loading') return <div className="status">{t('app.loading')}</div>;
  if (state.status === 'error') {
    return (
      <div className="status status-error" role="alert">
        <h1 className="h1-sm">{t('error.title')}</h1>
        <p className="mono small">{state.message}</p>
        <p className="dim">{t('error.hint')}</p>
      </div>
    );
  }
  return <Loaded catalog={state.value} />;
}
