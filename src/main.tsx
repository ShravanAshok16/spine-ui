import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async'; // 🔥 Added
import * as Sentry from "@sentry/react";
import posthog from 'posthog-js';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

Sentry.init({
  dsn: "YOUR_SENTRY_DSN_HERE", 
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
});

posthog.init('YOUR_POSTHOG_API_KEY', {
  api_host: 'https://app.posthog.com',
  person_profiles: 'identified_only',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider> {/* 🔥 Added Here */}
            <BrowserRouter>
              <ErrorBoundary>
                <App />
                <Toaster position="top-right" richColors />
              </ErrorBoundary>
            </BrowserRouter>
          </HelmetProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);