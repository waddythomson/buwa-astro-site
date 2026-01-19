// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://buwadigital.com',
  
  // Trailing slashes to match WordPress URLs
  trailingSlash: 'always',
  
  // Build options
  build: {
    format: 'directory'
  },
  
  // Redirects for any changed URLs (add here if needed)
  redirects: {
    // Example: '/old-url': '/new-url'
    '/host/': '/venue-partner/',
    '/ppc-pay-per-click/': '/pay-per-click-ppc/',
  },
  
  // Vite configuration
  vite: {
    build: {
      cssMinify: true,
    }
  }
});
