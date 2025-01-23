import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';

// Initialize Sentry
Sentry.init({
   dsn: import.meta.env.VITE_SENTRY_DSN,
   integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
   ],
   tracesSampleRate: 1.0,
   replaysSessionSampleRate: 0.1,
   replaysOnErrorSampleRate: 1.0,
});

function ErrorFallback({ error, resetErrorBoundary }) {
   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
            <div>
               <h2 className="text-center text-3xl font-extrabold text-gray-900">
                  Something went wrong
               </h2>
               <p className="mt-2 text-center text-sm text-gray-600">
                  We've been notified and are working to fix the issue.
               </p>
            </div>
            <pre className="text-red-600 text-sm overflow-auto">
               {error.message}
            </pre>
            <button
               onClick={resetErrorBoundary}
               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
               Try again
            </button>
         </div>
      </div>
   );
}

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
         <Toaster position="top-right" richColors closeButton />
         <App />
      </ErrorBoundary>
   </StrictMode>
);
