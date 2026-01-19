#!/usr/bin/env node
/**
 * WordPress to Astro Migration Script
 * 
 * This script fetches content from a WordPress REST API and converts it
 * to Astro-compatible Markdown files.
 * 
 * Usage:
 *   node scripts/migrate-wp.js https://your-wordpress-site.com
 * 
 * Prerequisites:
 *   npm install node-fetch turndown
 */

const fs = require('fs');
const path = require('path');

// You'll need to install these:
// npm install node-fetch@2 turndown
let fetch, TurndownService;

async function loadDependencies() {
  try {
    fetch = require('node-fetch');
    TurndownService = require('turndown');
  } catch (e) {
    console.error('Please install dependencies: npm install node-fetch@2 turndown');
    process.exit(1);
  }
}

const CONTENT_DIR = path.join(__dirname, '../src/content');
const POSTS_DIR = path.join(CONTENT_DIR, 'posts');
const PAGES_DIR = path.join(CONTENT_DIR, 'pages');
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

// Initialize Turndown for HTML to Markdown conversion
let turndown;

function initTurndown() {
  turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  // Custom rules for WordPress-specific elements
  turndown.addRule('wpCaption', {
    filter: (node) => node.classList && node.classList.contains('wp-caption'),
    replacement: (content, node) => {
      const img = node.querySelector('img');
      const caption = node.querySelector('.wp-caption-text');
      if (img) {
        const alt = caption ? caption.textContent : img.alt;
        return `\n\n![${alt}](${img.src})\n\n`;
      }
      return content;
    },
  });
}

async function fetchAllPages(wpUrl, endpoint) {
  const items = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${wpUrl}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&_embed`;
    console.log(`Fetching ${endpoint} page ${page}...`);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 400) {
          hasMore = false;
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        hasMore = false;
      } else {
        items.push(...data);
        page++;
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error.message);
      hasMore = false;
    }
  }
  
  return items;
}

function sanitizeFilename(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function convertToMarkdown(html) {
  if (!html) return '';
  
  // Fix WordPress image URLs before conversion
  let processed = html
    .replace(/<!--.*?-->/gs, '') // Remove HTML comments
    .replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gs, '$1'); // Remove caption shortcodes
  
  return turndown.turndown(processed);
}

function createFrontmatter(data, type = 'post') {
  const frontmatter = {
    title: data.title?.rendered || 'Untitled',
    pubDate: data.date,
    wpId: data.id,
    wpSlug: data.slug,
    status: data.status,
  };

  // Description from excerpt
  if (data.excerpt?.rendered) {
    frontmatter.description = data.excerpt.rendered
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 160);
  }

  // Featured image
  if (data._embedded?.['wp:featuredmedia']?.[0]) {
    const media = data._embedded['wp:featuredmedia'][0];
    frontmatter.featuredImage = media.source_url;
    frontmatter.featuredImageAlt = media.alt_text || '';
  }

  // Author
  if (data._embedded?.author?.[0]) {
    frontmatter.author = data._embedded.author[0].name;
  }

  // Categories and tags (for posts)
  if (type === 'post') {
    if (data._embedded?.['wp:term']) {
      const categories = data._embedded['wp:term']
        .flat()
        .filter((t) => t.taxonomy === 'category')
        .map((t) => t.name);
      const tags = data._embedded['wp:term']
        .flat()
        .filter((t) => t.taxonomy === 'post_tag')
        .map((t) => t.name);
      
      if (categories.length) frontmatter.categories = categories;
      if (tags.length) frontmatter.tags = tags;
    }
  }

  // Yoast SEO data (if available via plugin)
  if (data.yoast_head_json) {
    const yoast = data.yoast_head_json;
    if (yoast.title) frontmatter.seoTitle = yoast.title;
    if (yoast.description) frontmatter.seoDescription = yoast.description;
    if (yoast.canonical) frontmatter.canonicalUrl = yoast.canonical;
    if (yoast.robots?.index === 'noindex') frontmatter.noIndex = true;
  }

  return frontmatter;
}

function frontmatterToYaml(obj) {
  const lines = ['---'];
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      value.forEach((v) => lines.push(`  - "${v.replace(/"/g, '\\"')}"`));
    } else if (typeof value === 'string') {
      // Escape quotes and handle multiline
      const escaped = value.replace(/"/g, '\\"').replace(/\n/g, ' ');
      lines.push(`${key}: "${escaped}"`);
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    }
  }
  
  lines.push('---');
  return lines.join('\n');
}

async function migrateContent(wpUrl) {
  await loadDependencies();
  initTurndown();
  
  console.log(`\nMigrating content from: ${wpUrl}\n`);
  
  // Ensure directories exist
  [POSTS_DIR, PAGES_DIR, UPLOADS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Fetch and migrate posts
  console.log('=== Migrating Posts ===\n');
  const posts = await fetchAllPages(wpUrl, 'posts');
  console.log(`Found ${posts.length} posts\n`);

  for (const post of posts) {
    const frontmatter = createFrontmatter(post, 'post');
    const content = convertToMarkdown(post.content?.rendered || '');
    const filename = `${sanitizeFilename(post.slug)}.md`;
    const filepath = path.join(POSTS_DIR, filename);
    
    const markdown = `${frontmatterToYaml(frontmatter)}\n\n${content}`;
    fs.writeFileSync(filepath, markdown);
    console.log(`  ✓ ${post.slug}`);
  }

  // Fetch and migrate pages
  console.log('\n=== Migrating Pages ===\n');
  const pages = await fetchAllPages(wpUrl, 'pages');
  console.log(`Found ${pages.length} pages\n`);

  for (const page of pages) {
    const frontmatter = createFrontmatter(page, 'page');
    const content = convertToMarkdown(page.content?.rendered || '');
    const filename = `${sanitizeFilename(page.slug)}.md`;
    const filepath = path.join(PAGES_DIR, filename);
    
    const markdown = `${frontmatterToYaml(frontmatter)}\n\n${content}`;
    fs.writeFileSync(filepath, markdown);
    console.log(`  ✓ ${page.slug}`);
  }

  console.log('\n=== Migration Complete ===\n');
  console.log(`Posts: ${posts.length}`);
  console.log(`Pages: ${pages.length}`);
  console.log('\nNext steps:');
  console.log('1. Review migrated content in src/content/');
  console.log('2. Download and migrate media files to public/uploads/');
  console.log('3. Update image URLs in content files');
  console.log('4. Set up redirects in astro.config.mjs');
  console.log('5. Run `npm run dev` to preview\n');
}

// Main
const wpUrl = process.argv[2];
if (!wpUrl) {
  console.log('Usage: node scripts/migrate-wp.js https://your-wordpress-site.com');
  process.exit(1);
}

migrateContent(wpUrl.replace(/\/$/, '')).catch(console.error);
