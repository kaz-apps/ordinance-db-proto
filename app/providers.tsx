'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from '@/contexts/SnackbarContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1分
      refetchInterval: 2000, // 2秒ごとに再取得
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        {children}
      </SnackbarProvider>
    </QueryClientProvider>
  )
} 