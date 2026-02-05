import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  // Remove trailing slash to prevent double-slash URLs
  const siteUrl = (site?.href || 'https://buwadigital.com').replace(/\/$/, '');
  
  // Get all pages from the content collection
  const pages = await getCollection('pages');
  
  // Create sitemap entries for content pages
  const pageEntries = pages.map(page => {
    const slug = page.data.slug || page.slug;
    const url = slug === 'home' ? siteUrl : `${siteUrl}/${slug}/`;
    return `
    <url>
      <loc>${url}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${slug === 'home' ? '1.0' : '0.8'}</priority>
    </url>`;
  }).join('');

  // Add any additional static pages
  const staticPages = [
    { url: `${siteUrl}/contact-us/`, priority: '0.9' },
  ];

  const staticEntries = staticPages.map(page => `
    <url>
      <loc>${page.url}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${page.priority}</priority>
    </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageEntries}${staticEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
