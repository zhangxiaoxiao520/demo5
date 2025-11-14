/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ubdyfpjtlioxtxllmpvq.supabase.co'],
  },
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  },
}

module.exports = nextConfig