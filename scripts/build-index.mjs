#!/usr/bin/env node
// Builds the catalog data for the static site from the real files in this repository.
//
//   node scripts/build-index.mjs [--root <repo>] [--out <dir>]
//
// Writes <out>/index.json, releases.json, stats.json and bodies/*.md (default out: site/public).
// Source of truth: .claude-plugin/marketplace.json (which plugins exist) and each plugin's
// .claude-plugin/plugin.json (version, author, keywords, dependencies). Nothing is invented: a
// missing fact stays null and the site shows that it is missing.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const BODY_TEXT_LIMIT = 4000;
const KINDS = ['plugin', 'skill', 'agent', 'command', 'hook', 'mcp'];

// ---------- small helpers ----------

const readText = (path) => readFileSync(path, 'utf8');
const readJson = (path) => JSON.parse(readText(path));
const isDir = (path) => existsSync(path) && statSync(path).isDirectory();
const isFile = (path) => existsSync(path) && statSync(path).isFile();

function listDirs(path) {
  return isDir(path)
    ? readdirSync(path, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    : [];
}

function listFiles(path, ext) {
  return isDir(path)
    ? readdirSync(path, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.endsWith(ext))
        .map((d) => d.name)
        .sort()
    : [];
}

const ACRONYMS = new Set(['sdd', 'mcp', 'ui', 'api', 'sql', 'ai']);

export function displayName(name) {
  return name
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/** Splits `---` frontmatter from the Markdown body. A file without frontmatter has an empty data object. */
export function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) return { data: {}, body: source };
  let data = {};
  try {
    data = parseYaml(match[1]) ?? {};
  } catch (error) {
    throw new Error(`Invalid YAML frontmatter: ${error.message}`);
  }
  return { data: typeof data === 'object' && !Array.isArray(data) ? data : {}, body: match[2] };
}

/** Plain text of a Markdown document, for the search index only. */
export function toPlainText(markdown, limit = BODY_TEXT_LIMIT) {
  const text = markdown
    .replace(/```[a-z]*\n?/gi, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[\s|:-]{3,}$/gm, ' ')
    .replace(/[*_>|]+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > limit ? text.slice(0, limit) : text;
}

function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

function git(root, args) {
  try {
    return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

export function repoUrlFrom(root, env = process.env) {
  if (env.GITHUB_REPOSITORY) return `https://github.com/${env.GITHUB_REPOSITORY}`;
  const remote = git(root, ['remote', 'get-url', 'origin']);
  const match = /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/.exec(remote);
  return match ? `https://github.com/${match[1]}` : null;
}

function bodyFileName(id, suffix = '') {
  return `${id.replace(/[:/]/g, '__')}${suffix}.md`;
}

// ---------- changelog and compatibility ----------

/** Parses Keep-a-Changelog sections: `## [1.0.0] - 2026-10-20` or `## [1.0.0] - Unreleased`. */
export function parseChangelog(markdown) {
  const releases = [];
  const sections = markdown.split(/^## /m).slice(1);
  for (const section of sections) {
    const newline = section.indexOf('\n');
    const heading = (newline === -1 ? section : section.slice(0, newline)).trim();
    const notes = (newline === -1 ? '' : section.slice(newline + 1)).trim();
    const match = /^\[?v?([0-9][^\]\s]*)\]?\s*(?:[-–—]\s*(.+))?$/.exec(heading);
    if (!match) continue;
    const rawDate = (match[2] ?? '').trim();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;
    const firstBullet = /^[-*]\s+(.+)$/m.exec(notes);
    const summary = firstBullet ? toPlainText(firstBullet[1], 220) : '';
    releases.push({ version: match[1], date, summary, notes });
  }
  return releases;
}

export function parseCompatibility(markdown) {
  const match = /Minimum version:\s*\*\*([^*]+)\*\*/.exec(markdown);
  return match ? `Claude Code >= ${match[1].trim()}` : null;
}

// ---------- component readers ----------

function skillEntries(pluginDir) {
  return listDirs(join(pluginDir, 'skills'))
    .filter((dir) => isFile(join(pluginDir, 'skills', dir, 'SKILL.md')))
    .map((dir) => {
      const file = join(pluginDir, 'skills', dir, 'SKILL.md');
      const { data, body } = parseFrontmatter(readText(file));
      const name = String(data.name ?? dir);
      return {
        kind: 'skill',
        name,
        description: String(data.description ?? '').trim(),
        tools: toList(data['allowed-tools']),
        invocationFor: (plugin) => `/${plugin}:${name}`,
        source: `skills/${dir}`,
        markdown: body.trim(),
      };
    });
}

function agentEntries(pluginDir) {
  return listFiles(join(pluginDir, 'agents'), '.md').map((file) => {
    const { data, body } = parseFrontmatter(readText(join(pluginDir, 'agents', file)));
    const name = String(data.name ?? basename(file, '.md'));
    return {
      kind: 'agent',
      name,
      description: String(data.description ?? '').trim(),
      tools: toList(data.tools),
      invocationFor: (plugin) => `${plugin}:${name}`,
      source: `agents/${file}`,
      markdown: body.trim(),
    };
  });
}

function commandEntries(pluginDir) {
  return listFiles(join(pluginDir, 'commands'), '.md').map((file) => {
    const { data, body } = parseFrontmatter(readText(join(pluginDir, 'commands', file)));
    const name = basename(file, '.md');
    return {
      kind: 'command',
      name,
      description: String(data.description ?? '').trim(),
      tools: toList(data['allowed-tools']),
      invocationFor: (plugin) => `/${plugin}:${name}`,
      source: `commands/${file}`,
      markdown: body.trim(),
    };
  });
}

/** The leading `#` comment block of a shell script, without the shebang. */
export function scriptHeader(source) {
  const lines = [];
  for (const line of source.split('\n')) {
    if (line.startsWith('#!')) continue;
    if (!line.startsWith('#')) break;
    lines.push(line.replace(/^#\s?/, ''));
  }
  return lines.join('\n').trim();
}

function hookEntries(pluginDir) {
  const file = join(pluginDir, 'hooks', 'hooks.json');
  if (!isFile(file)) return [];
  const { hooks = {} } = readJson(file);
  const entries = [];
  for (const [event, groups] of Object.entries(hooks)) {
    for (const group of groups) {
      for (const hook of group.hooks ?? []) {
        const command = String(hook.command ?? '');
        const scriptMatch = /\/(hooks\/[^"\s]+)/.exec(command);
        const scriptRel = scriptMatch ? scriptMatch[1] : null;
        const scriptPath = scriptRel ? join(pluginDir, scriptRel) : null;
        const header = scriptPath && isFile(scriptPath) ? scriptHeader(readText(scriptPath)) : '';
        const name = scriptRel ? basename(scriptRel).replace(/\.[^.]+$/, '') : `${event}-hook`;
        const firstParagraph = header.split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ?? '';
        const matcher = group.matcher ? `\`${group.matcher}\`` : 'all tools';
        const markdown = [
          header,
          '',
          '| Event | Matcher | Command |',
          '|-------|---------|---------|',
          `| \`${event}\` | ${matcher} | \`${command.replace(/\|/g, '\\|')}\` |`,
        ].join('\n').trim();
        entries.push({
          kind: 'hook',
          name,
          description: firstParagraph || `${event} hook`,
          tools: [],
          invocationFor: () => '',
          source: scriptRel ?? 'hooks/hooks.json',
          markdown,
        });
      }
    }
  }
  return entries;
}

function mcpEntries(pluginDir) {
  const file = join(pluginDir, '.mcp.json');
  if (!isFile(file)) return [];
  const json = readJson(file);
  const servers = json.mcpServers ?? json;
  return Object.entries(servers).map(([name, config]) => ({
    kind: 'mcp',
    name,
    description: `MCP server ${name}`,
    tools: [],
    invocationFor: () => '',
    source: '.mcp.json',
    markdown: `\`\`\`json\n${JSON.stringify({ [name]: config }, null, 2)}\n\`\`\``,
  }));
}

// ---------- main build ----------

export function buildCatalog(root, env = process.env) {
  const marketplace = readJson(join(root, '.claude-plugin', 'marketplace.json'));
  const marketplaceName = marketplace.name;
  const repoUrl = repoUrlFrom(root, env);
  const commit = git(root, ['rev-parse', 'HEAD']) || null;
  const entries = [];
  const bodies = new Map();
  const releases = [];
  const errors = [];

  const plugins = marketplace.plugins.map((item) => {
    const dir = resolve(root, item.source);
    const manifest = readJson(join(dir, '.claude-plugin', 'plugin.json'));
    if (manifest.name !== item.name) {
      errors.push(`marketplace.json lists "${item.name}" but ${item.source}/.claude-plugin/plugin.json is named "${manifest.name}"`);
    }
    return { item, dir, manifest, relDir: item.source.replace(/^\.\//, '') };
  });

  const known = new Set(plugins.map((p) => p.manifest.name));
  const dependents = new Map([...known].map((n) => [n, []]));

  for (const { manifest, dir, relDir } of plugins) {
    const plugin = manifest.name;
    const author = manifest.author?.name ?? null;
    const keywords = toList(manifest.keywords);
    const dependencies = (manifest.dependencies ?? []).map((d) =>
      typeof d === 'string' ? { name: d, range: null } : { name: d.name, range: d.version ?? null });
    for (const dep of dependencies) {
      if (!known.has(dep.name)) {
        errors.push(`${plugin} depends on "${dep.name}", which is not in marketplace.json`);
      } else {
        dependents.get(dep.name).push(plugin);
      }
    }

    const updated = git(root, ['log', '-1', '--format=%cs', '--', relDir]) || null;
    const common = {
      plugin,
      keywords,
      author,
      version: manifest.version ?? null,
      updated,
      installText: `/plugin install ${plugin}@${marketplaceName}`,
    };
    const ghTree = (rel) => (repoUrl ? `${repoUrl}/tree/main/${relDir}${rel ? `/${rel}` : ''}` : null);

    const components = [
      ...skillEntries(dir), ...agentEntries(dir), ...commandEntries(dir), ...hookEntries(dir), ...mcpEntries(dir),
    ];
    const counts = Object.fromEntries(KINDS.filter((k) => k !== 'plugin').map((k) => [k, 0]));

    const readme = isFile(join(dir, 'README.md')) ? readText(join(dir, 'README.md')) : '';
    const compat = isFile(join(dir, 'COMPATIBILITY.md')) ? readText(join(dir, 'COMPATIBILITY.md')) : '';
    const changelogSource = isFile(join(dir, 'CHANGELOG.md')) ? readText(join(dir, 'CHANGELOG.md')) : '';
    const changelog = parseChangelog(changelogSource);

    const pluginId = `plugin:${plugin}`;
    bodies.set(bodyFileName(pluginId), readme);
    if (compat) bodies.set(bodyFileName(pluginId, '.compatibility'), compat);

    for (const release of changelog) {
      releases.push({
        plugin,
        displayName: displayName(plugin),
        version: release.version,
        date: release.date,
        summary: release.summary,
        notes: release.notes,
      });
    }

    const pluginEntry = {
      id: pluginId,
      kind: 'plugin',
      name: plugin,
      displayName: displayName(plugin),
      description: String(manifest.description ?? '').trim(),
      ...common,
      invocation: '',
      tools: [],
      githubUrl: ghTree(''),
      bodyText: toPlainText(readme),
      body: `bodies/${bodyFileName(pluginId)}`,
      compatibilityDoc: compat ? `bodies/${bodyFileName(pluginId, '.compatibility')}` : null,
      compatibility: parseCompatibility(compat),
      dependencies,
      dependents: [],
      counts,
      changelog: changelog.map(({ version, date, summary }) => ({ version, date, summary })),
    };
    entries.push(pluginEntry);

    for (const component of components) {
      const id = `${component.kind}:${plugin}/${component.name}`;
      counts[component.kind] += 1;
      bodies.set(bodyFileName(id), component.markdown);
      entries.push({
        id,
        kind: component.kind,
        name: component.name,
        displayName: displayName(component.name),
        description: component.description,
        ...common,
        invocation: component.invocationFor(plugin),
        tools: component.tools,
        githubUrl: ghTree(component.source),
        bodyText: toPlainText(component.markdown),
        body: `bodies/${bodyFileName(id)}`,
      });
    }
  }

  for (const entry of entries) {
    if (entry.kind === 'plugin') entry.dependents = dependents.get(entry.name).sort();
  }

  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.id)) errors.push(`Duplicate entry id ${entry.id}`);
    ids.add(entry.id);
    if (!entry.description) errors.push(`${entry.id} has no description`);
  }

  // Unreleased first, then newest date; stable by plugin name and version.
  releases.sort((a, b) => {
    if ((a.date === null) !== (b.date === null)) return a.date === null ? -1 : 1;
    return (b.date ?? '').localeCompare(a.date ?? '') || a.plugin.localeCompare(b.plugin) || b.version.localeCompare(a.version);
  });

  const generatedAt = new Date().toISOString();
  const stats = {
    generatedAt,
    commit,
    total: entries.length,
    byKind: Object.fromEntries(KINDS.map((k) => [k, entries.filter((e) => e.kind === k).length])),
  };
  const meta = {
    marketplace: marketplaceName,
    repoUrl,
    marketplaceAddCommand: repoUrl ? `/plugin marketplace add ${repoUrl.replace('https://github.com/', '')}` : null,
    generatedAt,
    commit,
  };

  return { index: { meta, entries }, releases, stats, bodies, errors };
}

export function writeCatalog(result, outDir) {
  rmSync(join(outDir, 'bodies'), { recursive: true, force: true });
  mkdirSync(join(outDir, 'bodies'), { recursive: true });
  writeFileSync(join(outDir, 'index.json'), `${JSON.stringify(result.index, null, 2)}\n`);
  writeFileSync(join(outDir, 'releases.json'), `${JSON.stringify(result.releases, null, 2)}\n`);
  writeFileSync(join(outDir, 'stats.json'), `${JSON.stringify(result.stats, null, 2)}\n`);
  for (const [file, content] of result.bodies) writeFileSync(join(outDir, 'bodies', file), content);
}

function main() {
  const args = process.argv.slice(2);
  const arg = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
  const root = resolve(arg('--root') ?? join(dirname(fileURLToPath(import.meta.url)), '..'));
  const outDir = resolve(arg('--out') ?? join(root, 'site', 'public'));

  const result = buildCatalog(root);
  if (result.errors.length > 0) {
    console.error('build-index failed:');
    for (const message of result.errors) console.error(`  - ${message}`);
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  writeCatalog(result, outDir);
  const { byKind, total } = result.stats;
  const summary = KINDS.filter((k) => byKind[k] > 0).map((k) => `${byKind[k]} ${k}`).join(', ');
  console.log(`build-index: ${total} entries (${summary}), ${result.releases.length} releases -> ${outDir}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
