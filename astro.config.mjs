// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://buwadigital.com',

  adapter: vercel(),
  
  // Trailing slashes to match WordPress URLs
  trailingSlash: 'always',
  
  // Build options
  build: {
    format: 'directory'
  },
  
  // Redirects for any changed URLs (add here if needed)
  redirects: {
    // Example: '/old-url': '/new-url'
    '/host/': '/buwatv/#host-partner',
    '/venue-partner/': '/buwatv/#host-partner',
    '/ppc-pay-per-click/': '/pay-per-click-ppc/',
    '/screen-advertising/': '/buwatv/',
    '/host-partner/': '/buwatv/#host-partner',
    '/locations/': '/buwatv/locations/',
    '/about/': '/buwatv/about/',
    '/pricing/': '/buwatv/pricing/',
    '/host-pricing/': '/buwatv/host-pricing/',
    '/faq/': '/buwatv/faq/',
    '/signup/': '/buwatv/signup/',
    '/signupThanks/': '/buwatv/signupThanks/',
    '/signup/thank-you/': '/buwatv/signupThanks/',
    '/hostEval/': '/buwatv/hostEval/',
    '/host-evaluation/': '/buwatv/hostEval/',
    '/privacy/': '/buwatv/privacy/',
  },
  
  // Vite configuration
  vite: {
    build: {
      cssMinify: true,
    }
  }
});
