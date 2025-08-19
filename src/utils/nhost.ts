import { NhostClient } from '@nhost/react';

// Initialize Nhost client with configuration from environment variables
const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
  // Recommended settings for web apps
  clientStorageType: 'localStorage',
  autoSignIn: true,
  autoRefreshToken: true
});

export { nhost };
