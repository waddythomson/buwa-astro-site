import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const archivePattern = /(?:^|\/)archive\//i;
  const pages = (await getCollection('pages'))
    .filter(page => !archivePattern.test(page.id)); // ignore archived content
  const siteUrl = site?.href || 'https://buwadigital.com';
  const reservedSlugs = new Set(['home', 'contact-us', 'google-business-profile']);
  
  const staticPages = [
    { url: '/', priority: '1.0' },
  ];
  
  const contentPages = pages
    .filter(page => !reservedSlugs.has(page.data.slug || page.slug))
    .map(page => ({
      url: `/${page.data.slug || page.slug}/`,
      priority: '0.8',
      lastmod: page.data.modified || page.data.date
    }));
  
  const allPages = [...staticPages, ...contentPages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};