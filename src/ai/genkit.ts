
import {genkit, type Genkit as GenkitType} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: GenkitType;

try {
  // Attempt to initialize Genkit with plugins
  aiInstance = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
  });
} catch (error: any) {
  // Check if the error is due to missing credentials
  if (error.message.includes('GOOGLE_API_KEY') || error.message.includes('Could not load the default credentials')) {
    console.warn(
      '\n[Genkit Warning] Failed to initialize Google AI plugin due to missing credentials.' +
      '\nAI-related features will be disabled. To enable them, set the GOOGLE_API_KEY or' +
      '\nGOOGLE_APPLICATION_CREDENTIALS environment variables.\n'
    );
    // If initialization fails, create a "mock" genkit object with no-op functions
    // This prevents the application from crashing when AI features are called.
    aiInstance = {
        defineFlow: (config, fn) => fn,
        definePrompt: (config, fn) => fn,
        defineTool: (config, fn) => fn,
        generate: () => Promise.reject(new Error("AI features are disabled due to missing credentials.")),
        // @ts-ignore - Mocking a private or complex property
        dotcom: null, 
    } as unknown as GenkitType;
  } else {
    // For any other initialization errors, re-throw them
    console.error("An unexpected error occurred during Genkit initialization:", error);
    throw error;
  }
}

export const ai = aiInstance;
