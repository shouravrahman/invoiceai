import * as Sentry from "@sentry/react";

export function captureError(error: Error, context?: Record<string, any>) {
  console.error(error);
  
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context
    });
  }
}