
'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance with necessary plugins.
 * It ensures that Genkit is configured centrally for the entire application.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Specify the API version.
      apiVersion: 'v1beta',
    }),
  ],
  // Log all traces to the console for debugging purposes.
  logSinks: ['console'],
  // Enable tracing for all flows.
  traceStore: 'memory',
});
