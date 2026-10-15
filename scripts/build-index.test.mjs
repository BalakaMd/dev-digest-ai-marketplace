import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import {
  buildCatalog, displayName, parseChangelog, parseCompatibility, parseFrontmatter, scriptHeader, toPlainText, writeCatalog,
} from './build-index.mjs';

const roots = [];
after(() => roots.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

function write(root, rel, content) {
  const path = join(root, rel);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

/** A minimal two-plugin marketplace: `base` has a skill, `app` depends on `base`. */
function fixture({ appDependsOn = 'base' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'catalog-'));
  roots.push(root);
  write(root, '.claude-plugin/marketplace.json', JSON.stringify({
    name: 'demo-market',
    plugins: [{ name: 'base', source: './plugins/base' }, { name: 'app', source: './plugins/app' }],
  }));
  write(root, 'plugins/base/.claude-plugin/plugin.json', JSON.stringify({
    name: 'base', version: '1.2.0', description: 'Base plugin.', author: { name: 'Team' }, keywords: ['core'],
  }));
  write(root, 'plugins/base/README.md', '# Base\n\nBase readme.\n');
  write(root, 'plugins/base/CHANGELOG.md',
    '# Changelog\n\n## [1.2.0] - 2026-03-01\n\n### Added\n- Second feature.\n\n## [1.0.0] - Unreleased\n\n- First feature.\n');
  write(root, 'plugins/base/COMPATIBILITY.md', '# Compatibility\n\nMinimum version: **2.1.110**.\n');
  write(root, 'plugins/base/skills/lint/SKILL.md',
    '---\nname: lint\ndescription: "Lint things: quickly."\nallowed-tools: Read, Grep\n---\n\n# Lint\n\nUnique zebra phrase.\n');
  write(root, 'plugins/app/.claude-plugin/plugin.json', JSON.stringify({
    name: 'app', version: '0.1.0', description: 'App plugin.', author: { name: 'Team' }, keywords: ['app'],
    dependencies: [{ name: appDependsOn, version: '^1.0.0' }],
  }));
  write(root, 'plugins/app/agents/helper.md', '---\nname: helper\ndescription: Helps.\ntools: Read, Bash\n---\nBody.\n');
  write(root, 'plugins/app/hooks/hooks.json', JSON.stringify({
    hooks: { PreToolUse: [{ matcher: 'Write|Bash', hooks: [{ type: 'command', command: '"${CLAUDE_PLUGIN_ROOT}"/hooks/guard.sh' }] }] },
  }));
  write(root, 'plugins/app/hooks/guard.sh', '#!/usr/bin/env bash\n# Guard for the helper agent.\n#\n# Second paragraph.\n\nexit 0\n');
  return root;
}

describe('helpers', () => {
  test('parseFrontmatter reads quoted and plain values', () => {
    const { data, body } = parseFrontmatter('---\nname: x\ndescription: "a: b"\n---\nText\n');
    assert.equal(data.name, 'x');
    assert.equal(data.description, 'a: b');
    assert.equal(body, 'Text\n');
  });

  test('parseFrontmatter tolerates a file without frontmatter', () => {
    assert.deepEqual(parseFrontmatter('Just text').data, {});
  });

  test('parseChangelog separates dated and unreleased sections', () => {
    const releases = parseChangelog('## [1.1.0] - 2026-02-02\n- Added a\n\n## [1.0.0] - Unreleased\n- Initial\n');
    assert.deepEqual(releases.map((r) => [r.version, r.date]), [['1.1.0', '2026-02-02'], ['1.0.0', null]]);
    assert.equal(releases[0].summary, 'Added a');
  });

  test('parseCompatibility finds the minimum version', () => {
    assert.equal(parseCompatibility('Minimum version: **2.1.110**.'), 'Claude Code >= 2.1.110');
    assert.equal(parseCompatibility('nothing here'), null);
  });

  test('displayName humanises names and keeps acronyms', () => {
    assert.equal(displayName('run-plan'), 'Run Plan');
    assert.equal(displayName('sdd-engineering'), 'SDD Engineering');
  });

  test('toPlainText strips Markdown and caps length', () => {
    assert.equal(toPlainText('# Title\n\nSome `code` and [link](http://x).'), 'Title Some code and link.');
    assert.equal(toPlainText('a'.repeat(50), 10).length, 10);
  });

  test('scriptHeader returns the leading comment block', () => {
    assert.equal(scriptHeader('#!/bin/sh\n# One\n#\n# Two\necho hi\n'), 'One\n\nTwo');
  });
});

describe('buildCatalog', () => {
  test('lists every plugin and component with real fields', () => {
    const { index, errors, releases, stats } = buildCatalog(fixture(), {});
    assert.deepEqual(errors, []);
    assert.deepEqual(index.entries.map((e) => e.id).sort(), [
      'agent:app/helper', 'hook:app/guard', 'plugin:app', 'plugin:base', 'skill:base/lint',
    ]);
    const skill = index.entries.find((e) => e.id === 'skill:base/lint');
    assert.equal(skill.invocation, '/base:lint');
    assert.deepEqual(skill.tools, ['Read', 'Grep']);
    assert.equal(skill.version, '1.2.0');
    assert.equal(skill.installText, '/plugin install base@demo-market');
    const hook = index.entries.find((e) => e.id === 'hook:app/guard');
    assert.equal(hook.description, 'Guard for the helper agent.');
    assert.equal(stats.byKind.skill, 1);
    assert.equal(stats.total, 5);
    assert.equal(releases[0].date, null, 'unreleased sorts first');
  });

  test('records dependencies and dependents', () => {
    const { index } = buildCatalog(fixture(), {});
    const app = index.entries.find((e) => e.id === 'plugin:app');
    const base = index.entries.find((e) => e.id === 'plugin:base');
    assert.deepEqual(app.dependencies, [{ name: 'base', range: '^1.0.0' }]);
    assert.deepEqual(base.dependents, ['app']);
    assert.equal(base.compatibility, 'Claude Code >= 2.1.110');
  });

  test('a word that only occurs in a skill body is in its search text', () => {
    const { index } = buildCatalog(fixture(), {});
    const hits = index.entries.filter((e) => e.bodyText.includes('zebra'));
    assert.deepEqual(hits.map((e) => e.id), ['skill:base/lint']);
  });

  test('a new skill folder appears with no other edit', () => {
    const root = fixture();
    const before = buildCatalog(root, {}).index.entries.length;
    write(root, 'plugins/base/skills/format/SKILL.md', '---\nname: format\ndescription: Formats.\n---\nBody\n');
    assert.equal(buildCatalog(root, {}).index.entries.length, before + 1);
  });

  test('a dependency missing from the marketplace is an error', () => {
    const { errors } = buildCatalog(fixture({ appDependsOn: 'ghost' }), {});
    assert.match(errors.join('\n'), /depends on "ghost"/);
  });

  test('a component without a description is an error', () => {
    const root = fixture();
    write(root, 'plugins/base/skills/bare/SKILL.md', '---\nname: bare\n---\nBody\n');
    assert.match(buildCatalog(root, {}).errors.join('\n'), /skill:base\/bare has no description/);
  });

  test('writeCatalog produces the four outputs', () => {
    const out = mkdtempSync(join(tmpdir(), 'catalog-out-'));
    roots.push(out);
    const result = buildCatalog(fixture(), {});
    writeCatalog(result, out);
    const index = JSON.parse(readFileSync(join(out, 'index.json'), 'utf8'));
    assert.equal(index.entries.length, 5);
    assert.ok(JSON.parse(readFileSync(join(out, 'releases.json'), 'utf8')).length >= 2);
    assert.equal(JSON.parse(readFileSync(join(out, 'stats.json'), 'utf8')).total, 5);
    assert.match(readFileSync(join(out, 'bodies', 'skill__base__lint.md'), 'utf8'), /zebra/);
  });
});
