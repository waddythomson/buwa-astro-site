import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  // Remove trailing slash to prevent double-slash URLs
  const siteUrl = (site?.href || 'https://buwadigital.com').replace(/\/$/, '');
  const buildDate = new Date().toISOString().split('T')[0];
  const buwatvNoindex = import.meta.env.PUBLIC_BUWATV_NOINDEX === 'true';
  const urlSet = new Set<string>();

  const formatDate = (date?: Date) =>
    date instanceof Date && !Number.isNaN(date.valueOf())
      ? date.toISOString().split('T')[0]
      : buildDate;

  const addEntry = (loc: string, lastmod: string, changefreq: string, priority: string) => {
    if (urlSet.has(loc)) return '';
    urlSet.add(loc);
    return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;
  };

  // Content pages
  const archivePattern = /(?:^|\/)archive\//i;
  const pages = (await getCollection('pages'))
    .filter(page => !archivePattern.test(page.id))
    .filter(page => !page.data.noIndex);

  const pageEntries = pages.map(page => {
    const slug = page.data.slug || page.slug;
    const url = slug === 'home' ? siteUrl : `${siteUrl}/${slug}/`;
    const lastmod = formatDate(
      page.data.updatedDate ||
      page.data.modified ||
      page.data.pubDate ||
      page.data.date
    );
    const priority = slug === 'home' ? '1.0' : '0.8';
    return addEntry(url, lastmod, 'weekly', priority);
  }).join('');

  // Blog posts
  const posts = (await getCollection('posts'))
    .filter(post => post.data.status === 'publish')
    .filter(post => !post.data.noIndex);

  const postEntries = posts.map(post => {
    const url = `${siteUrl}/blog/${post.slug}/`;
    const lastmod = formatDate(post.data.updatedDate || post.data.pubDate);
    return addEntry(url, lastmod, 'monthly', '0.7');
  }).join('');

  // Static routes from src/pages
  const staticRoutes = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/about-us/', changefreq: 'monthly', priority: '0.8' },
    { path: '/solutions/', changefreq: 'monthly', priority: '0.9' },
    { path: '/google-business-profile/', changefreq: 'monthly', priority: '0.8' },
    { path: '/contact-us/', changefreq: 'monthly', priority: '0.9' },
    { path: '/terms/', changefreq: 'yearly', priority: '0.3' },
    { path: '/thank-you/', changefreq: 'yearly', priority: '0.3' },
  ];

  if (!buwatvNoindex) {
    staticRoutes.push(
      { path: '/buwatv/', changefreq: 'weekly', priority: '0.9' },
      { path: '/buwatv/about/', changefreq: 'monthly', priority: '0.7' },
      { path: '/buwatv/pricing/', changefreq: 'monthly', priority: '0.8' },
      { path: '/buwatv/host-pricing/', changefreq: 'monthly', priority: '0.7' },
      { path: '/buwatv/locations/', changefreq: 'monthly', priority: '0.7' },
      { path: '/buwatv/faq/', changefreq: 'monthly', priority: '0.6' },
      { path: '/buwatv/signup/', changefreq: 'monthly', priority: '0.6' },
      { path: '/buwatv/hostEval/', changefreq: 'monthly', priority: '0.6' },
      { path: '/buwatv/privacy/', changefreq: 'yearly', priority: '0.3' },
      { path: '/buwatv/terms/', changefreq: 'yearly', priority: '0.3' },
    );
  }

  const staticEntries = staticRoutes.map(route => {
    const url = `${siteUrl}${route.path}`;
    return addEntry(url, buildDate, route.changefreq, route.priority);
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageEntries}${postEntries}${staticEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
