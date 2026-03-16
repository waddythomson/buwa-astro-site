#!/usr/bin/env node

/**
 * Partner Logo Migration Script
 * Copies logos from old split folders to public/uploads/partners/
 * with proper kebab-case filenames, then updates partners.json
 *
 * Run from project root: node migrate-partners.js
 */

import fs from 'fs';
import path from 'path';

const HOSTS_DIR = 'public/buwatv/uploads/partners/hosts';
const NON_HOSTS_DIR = 'public/buwatv/uploads/partners/non-hosts';
const TARGET_DIR = 'public/uploads/partners';
const PARTNERS_JSON = 'src/data/buwatv/partners.json';

// Mapping: old filename → new filename
// Files not in this map are already correctly named and just get copied as-is
const RENAME_MAP = {
  // Hosts
  '3FFLogo.png':                      '3-fold-fitness.png',
  "BJ'sXclusiveKutzLogo.png":         'bjs-xclusive-kutz.png',
  "Bill's Logo.png":                   'bills-music-shop.png',
  'BuddysLogo.jpeg':                   'buddys-liquor-wine.jpeg',
  'CablesEtcLogo.jpg':                 'cables-etc.jpg',
  'Carpet_One_Logo256.jpg':            'carpet-one.jpg',
  'CentralSouthCarolinaHFH_Black.jpg': 'habitat-for-humanity.jpg',
  'ChapinPharmLogo.png':               'chapin-pharmacy.png',
  'ChileCalLogo.png':                  'chile-caliente.png',
  'ColaKicksLogo.png':                 'cola-kicks.png',
  'KarKareLogo.png':                   'kar-kare.png',
  'LevelUpLogo.jpeg':                  'level-up-healthcare.jpeg',
  'OTL-logo.jpg':                      'on-the-line-training.jpg',
  'OriginalGymlogo.jpg':               'the-original-gym.jpg',
  'PalmettoShopLogo.png':              'the-palmetto-shop.png',
  'PawmettoLogo.png':                  'pawmetto-lifeline.png',
  'PlayItAgainSportsLogo.jpeg':        'play-it-again-sports.jpeg',
  'RaveLogo.png':                      'rave-installation.png',
  'RedbirdLogo.png':                   'redbird-paper-chemical.png',
  'SalvationLogo.png':                 'salvation-army.png',
  'StackedLogo1.png':                  'stacked.png',
  'VitaliLogo.jpeg':                   'vitali-family-karate.jpeg',
  'bierkeller.jpg':                    'bierkeller-brewing.jpg',
  'cwcLogo.webp':                      'cwc-chamber.webp',
  'devine-nails.png':                  'devine-nail-spa.png',
  'genova-karate.png':                 'genova-family-karate.png',
  'veritas.png':                       'veritas-urgent-care.png',
  // Non-hosts
  'Beckett-Financial-Logo.png':        'beckett-financial.png',
  'Classic-Roofing.png':               'classic-roofing.png',
  'Covenant-Fence-Logo.png':           'covenant-fence.png',
  'LifeTime-scnc-logo-2024.png':       'lifetime-insurance.png',
  'MilestoneLogo.jpg':                 'milestone-wealth-advisors.jpg',
  'Sharpe-Leventis-LLC.png':           'sharpe-leventis.png',
  'TLC-Wedsite-Logo-2025-1-2.webp':    'tlc.webp',
};

// Partners JSON logo field updates: old logo value → new logo value
// This covers renames + the duplicate Roxanne's USC fix
const JSON_LOGO_MAP = {
  'RaveLogo.png':                      'rave-installation.png',
  'RedbirdLogo.png':                   'redbird-paper-chemical.png',
  'CablesEtcLogo.jpg':                 'cables-etc.jpg',
  'PalmettoShopLogo.png':              'the-palmetto-shop.png',
  'StackedLogo1.png':                  'stacked.png',
  "BJ'sXclusiveKutzLogo.png":         'bjs-xclusive-kutz.png',
  "Bill's Logo.png":                   'bills-music-shop.png',
  'OriginalGymlogo.jpg':               'the-original-gym.jpg',
  'CentralSouthCarolinaHFH_Black.jpg': 'habitat-for-humanity.jpg',
  'Carpet_One_Logo256.jpg':            'carpet-one.jpg',
  'PawmettoLogo.png':                  'pawmetto-lifeline.png',
  'BuddysLogo.jpeg':                   'buddys-liquor-wine.jpeg',
  'PlayItAgainSportsLogo.jpeg':        'play-it-again-sports.jpeg',
  'KarKareLogo.png':                   'kar-kare.png',
  'SalvationLogo.png':                 'salvation-army.png',
  'LevelUpLogo.jpeg':                  'level-up-healthcare.jpeg',
  'VitaliLogo.jpeg':                   'vitali-family-karate.jpeg',
  'ChileCalLogo.png':                  'chile-caliente.png',
  'ChapinPharmLogo.png':               'chapin-pharmacy.png',
  'ColaKicksLogo.png':                 'cola-kicks.png',
  '3FFLogo.png':                       '3-fold-fitness.png',
  'OTL-logo.jpg':                      'on-the-line-training.jpg',
  'bierkeller.jpg':                    'bierkeller-brewing.jpg',
  'cwcLogo.webp':                      'cwc-chamber.webp',
  'devine-nails.png':                  'devine-nail-spa.png',
  'genova-karate.png':                 'genova-family-karate.png',
  'veritas.png':                       'veritas-urgent-care.png',
  'Beckett-Financial-Logo.png':        'beckett-financial.png',
  'Classic-Roofing.png':               'classic-roofing.png',
  'Covenant-Fence-Logo.png':           'covenant-fence.png',
  'LifeTime-scnc-logo-2024.png':       'lifetime-insurance.png',
  'MilestoneLogo.jpg':                 'milestone-wealth-advisors.jpg',
  'Sharpe-Leventis-LLC.png':           'sharpe-leventis.png',
  'TLC-Wedsite-Logo-2025-1-2.webp':    'tlc.webp',
};

// Partner names that need their logo changed to a unique copy
// (Roxanne's USC was using the same file as Roxanne's Market)
const SPECIAL_COPIES = [
  {
    src: 'roxannes-market.png',
    dest: 'roxannes-usc.png',
    partnerName: "Roxanne's USC",
  },
];

// ─── Step 1: Create target directory ────────────────────────────────────────
fs.mkdirSync(TARGET_DIR, { recursive: true });
console.log(`\n✅ Created/verified: ${TARGET_DIR}\n`);

// ─── Step 2: Copy files from both source dirs ────────────────────────────────
let copied = 0;
let skipped = 0;

function copyFromDir(srcDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`⚠️  Source dir not found, skipping: ${srcDir}`);
    return;
  }
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const newName = RENAME_MAP[file] ?? file;
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(TARGET_DIR, newName);

    if (fs.existsSync(destPath)) {
      console.log(`  ⏭  Already exists, skipping: ${newName}`);
      skipped++;
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
    const changed = newName !== file ? ` → ${newName}` : '';
    console.log(`  📋 Copied: ${file}${changed}`);
    copied++;
  }
}

console.log('📁 Copying from hosts/...');
copyFromDir(HOSTS_DIR);

console.log('\n📁 Copying from non-hosts/...');
copyFromDir(NON_HOSTS_DIR);

// ─── Step 3: Handle special copies (Roxanne's USC) ──────────────────────────
console.log('\n📋 Handling special copies...');
for (const { src, dest, partnerName } of SPECIAL_COPIES) {
  const srcPath = path.join(TARGET_DIR, src);
  const destPath = path.join(TARGET_DIR, dest);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠️  Source not found for special copy: ${src}`);
    continue;
  }
  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  📋 Created ${dest} for "${partnerName}"`);
  } else {
    console.log(`  ⏭  Already exists: ${dest}`);
  }
}

// ─── Step 4: Update partners.json ───────────────────────────────────────────
console.log('\n📝 Updating partners.json...');
const raw = fs.readFileSync(PARTNERS_JSON, 'utf8');
const data = JSON.parse(raw);

let jsonUpdates = 0;

function updatePartners(arr) {
  for (const partner of arr) {
    // Fix logo filename
    if (JSON_LOGO_MAP[partner.logo]) {
      console.log(`  🔄 ${partner.name}: ${partner.logo} → ${JSON_LOGO_MAP[partner.logo]}`);
      partner.logo = JSON_LOGO_MAP[partner.logo];
      jsonUpdates++;
    }
    // Fix Roxanne's USC to its own copy
    if (partner.name === "Roxanne's USC") {
      console.log(`  🔄 ${partner.name}: logo → roxannes-usc.png`);
      partner.logo = 'roxannes-usc.png';
      jsonUpdates++;
    }
  }
}

updatePartners(data.hostPartners ?? []);
updatePartners(data.communityPartners ?? []);

fs.writeFileSync(PARTNERS_JSON, JSON.stringify(data, null, 2), 'utf8');

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Migration complete!
   Files copied:       ${copied}
   Files skipped:      ${skipped}
   JSON fields updated: ${jsonUpdates}

Next steps:
  1. Run: npm run validate:partners
  2. Verify logos look correct on the site
  3. Commit and push to dev for testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
