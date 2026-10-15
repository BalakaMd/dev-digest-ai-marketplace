import DOMPurify from 'dompurify';
import { marked } from 'marked';

const ABSOLUTE = /^([a-z][a-z0-9+.-]*:|#|\/\/)/i;

/** Renders Markdown to sanitised HTML. Relative links resolve against `linkBase` (a GitHub blob URL). */
export function renderMarkdown(source: string, linkBase: string | null): string {
  const html = marked.parse(source, { async: false, gfm: true }) as string;
  const purifier = DOMPurify;
  purifier.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName !== 'A') return;
    const href = node.getAttribute('href');
    if (!href) return;
    if (ABSOLUTE.test(href)) {
      if (!href.startsWith('#')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    } else if (linkBase) {
      node.setAttribute('href', new URL(href, linkBase).toString());
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    } else {
      node.removeAttribute('href');
    }
  });
  try {
    return purifier.sanitize(html, { USE_PROFILES: { html: true } });
  } finally {
    purifier.removeHook('afterSanitizeAttributes');
  }
}

/** The GitHub URL that relative links inside an entry's Markdown should resolve against. */
export function linkBaseFor(kind: string, githubUrl: string | null): string | null {
  if (!githubUrl) return null;
  const blob = githubUrl.replace('/tree/', '/blob/');
  if (kind === 'plugin' || kind === 'skill') return `${blob}/`;
  return blob.slice(0, blob.lastIndexOf('/') + 1);
}
