import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import ErrorBoundary from './components/common/ErrorBoundary.tsx'
import { ThemeProvider } from './components/common/ThemeProvider.tsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Không refetch khi component mount lại nếu data đã có
      retry: 1,
      staleTime: 10 * 60 * 1000, // 10 minutes - tăng thời gian cache
      gcTime: 30 * 60 * 1000, // 30 minutes - giữ cache lâu hơn
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
