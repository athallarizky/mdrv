import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './store'
import { ErrorBoundary, ThemeProvider } from './components'
import { Toaster } from './components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <App />
          <Toaster />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
