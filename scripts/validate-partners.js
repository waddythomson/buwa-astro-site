#!/usr/bin/env node
/**
 * validate-partners.js
 * Validates src/data/partners.json against the BuWa Digital partner naming convention.
 *
 * Checks:
 *   1. Every logo referenced in JSON exists in public/uploads/partners/
 *   2. No duplicate partner names across arrays
 *   3. No duplicate logo filenames across arrays
 *   4. Filenames follow lowercase-kebab-case convention (no uppercase, spaces, or apostrophes)
 *
 * Usage: node scripts/validate-partners.js
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const JSON_PATH = resolve(ROOT, 'src/data/partners.json');
const LOGOS_DIR = resolve(ROOT, 'public/uploads/partners');

const KEBAB_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(png|jpg|jpeg|webp|svg|gif)$/;

let errors = [];
let warnings = [];

// ── Load JSON ──────────────────────────────────────────────────────────────
if (!existsSync(JSON_PATH)) {
  console.error(`❌  partners.json not found at: ${JSON_PATH}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
} catch (e) {
  console.error(`❌  Failed to parse partners.json: ${e.message}`);
  process.exit(1);
}

const hostPartners      = data.hostPartners      ?? [];
const communityPartners = data.communityPartners ?? [];
const allPartners       = [
  ...hostPartners.map(p => ({ ...p, _source: 'hostPartners' })),
  ...communityPartners.map(p => ({ ...p, _source: 'communityPartners' })),
];

// ── 1. Duplicate partner names ─────────────────────────────────────────────
const seenNames = new Map();
for (const partner of allPartners) {
  const key = (partner.name ?? '').trim().toLowerCase();
  if (!key) {
    errors.push(`Missing name in ${partner._source}`);
    continue;
  }
  if (seenNames.has(key)) {
    errors.push(`Duplicate partner name: "${partner.name}" (in ${partner._source} and ${seenNames.get(key)})`);
  } else {
    seenNames.set(key, partner._source);
  }
}

// ── 2. Duplicate logo filenames ────────────────────────────────────────────
const seenLogos = new Map();
for (const partner of allPartners) {
  if (!partner.logo) continue;
  const key = partner.logo.trim().toLowerCase();
  if (seenLogos.has(key)) {
    errors.push(`Duplicate logo filename: "${partner.logo}" used by "${partner.name}" and "${seenLogos.get(key)}"`);
  } else {
    seenLogos.set(key, partner.name);
  }
}

// ── 3. Filename convention + file existence ────────────────────────────────
for (const partner of allPartners) {
  if (!partner.logo) {
    warnings.push(`"${partner.name}" (${partner._source}) has no logo set`);
    continue;
  }

  const filename = partner.logo.trim();

  // Convention check
  if (!KEBAB_REGEX.test(filename)) {
    errors.push(
      `Bad filename for "${partner.name}": "${filename}" — must be lowercase-kebab-case with a valid extension (.png .jpg .jpeg .webp .svg .gif). ` +
      `Suggested: "${toKebab(filename)}"`
    );
  }

  // File existence check
  const filePath = resolve(LOGOS_DIR, filename);
  if (!existsSync(filePath)) {
    errors.push(`Missing logo file for "${partner.name}": public/uploads/partners/${filename}`);
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────
function toKebab(filename) {
  const ext = filename.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? '';
  const base = filename.replace(/\.[^.]+$/, '');
  return base
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + ext;
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('  BuWa Digital — Partner Data Validator');
console.log('══════════════════════════════════════════\n');
console.log(`  JSON:      src/data/partners.json`);
console.log(`  Logos dir: public/uploads/partners/`);
console.log(`  Partners:  ${hostPartners.length} host + ${communityPartners.length} community = ${allPartners.length} total\n`);

if (warnings.length > 0) {
  console.log(`⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach(w => console.log(`   • ${w}`));
  console.log('');
}

if (errors.length === 0) {
  console.log('✅  All checks passed — partner data looks great!\n');
  process.exit(0);
} else {
  console.log(`❌  ERRORS (${errors.length}) — fix these before merging:\n`);
  errors.forEach(e => console.log(`   ✗ ${e}`));
  console.log('');
  process.exit(1);
}
