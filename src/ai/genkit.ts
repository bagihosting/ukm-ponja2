
import {genkit, type Genkit as GenkitType} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: GenkitType;

try {
  // Attempt to initialize Genkit with plugins
  aiInstance = genkit({
    plugins: [googleAI()],
  });
} catch (error: any) {
  // Check if the error is due to missing credentials
  if (error.message.includes('GEMINI_API_KEY') || error.message.includes('Could not load the default credentials')) {
    console.warn(
      '\n[Genkit Warning] Failed to initialize Google AI plugin due to missing credentials.' +
      '\nAI-related features will be disabled. To enable them, set the GEMINI_API_KEY or' +
      '\nGOOGLE_APPLICATION_CREDENTIALS environment variables.\n'
    );
    // If initialization fails, create a "mock" genkit object with no-op functions
    // This prevents the application from crashing when AI features are called.
    const disabledError = new Error("AI features are disabled due to missing credentials.");
    
    const mockFlow = (config: any, fn: any) => fn;

    aiInstance = {
        defineFlow: mockFlow as any,
        definePrompt: mockFlow as any,
        defineTool: mockFlow as any,
        // Make `generate` explicitly throw a controlled error.
        generate: () => Promise.reject(disabledError),
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
