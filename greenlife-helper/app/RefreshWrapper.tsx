'use client'

import { RefreshProvider } from '@/lib/refreshManager'

export default function RefreshWrapper({ children }: { children: React.ReactNode }) {
  return (
    <RefreshProvider>
      {children}
    </RefreshProvider>
  )
}