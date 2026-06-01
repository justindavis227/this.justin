import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  webpack: (config) => {
    // Bust stale webpack module cache (v2 = post-DB-driven-sidebar rewrite).
    // Bump this version number any time a full cache clear is needed.
    if (config.cache && typeof config.cache === 'object') {
      (config.cache as Record<string, unknown>).version = 'v2'
    }
    return config
  },
}

export default nextConfig
