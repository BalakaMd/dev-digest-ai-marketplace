#!/usr/bin/env node
// Fails when a tracked text file contains Cyrillic letters: this repository is English only.
//   node scripts/check-english.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Built from code points so this file itself contains no Cyrillic: the range U+0400 to U+04FF.
const CYRILLIC = new RegExp(`[${String.fromCharCode(0x400)}-${String.fromCharCode(0x4ff)}]`);
const SKIP = /(^|\/)package-lock\.json$/;

const files = execFileSync('git', ['-C', root, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && !SKIP.test(f));

const offenders = [];
for (const file of files) {
  let buffer;
  try {
    buffer = readFileSync(join(root, file));
  } catch {
    continue; // deleted but still listed
  }
  if (buffer.includes(0)) continue; // binary
  const lines = buffer.toString('utf8').split('\n');
  lines.forEach((line, i) => {
    if (CYRILLIC.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim().slice(0, 80)}`);
  });
}

if (offenders.length > 0) {
  console.error(`Non-English (Cyrillic) text found in ${offenders.length} line(s):`);
  for (const o of offenders) console.error(`  ${o}`);
  process.exit(1);
}
console.log(`check-english: ${files.length} files, no Cyrillic text`);
