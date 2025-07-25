
'use server';
/**
 * @fileOverview A flow for generating images from a text prompt and uploading them to Firebase Storage.
 *
 * - generateImage - A function that handles the image generation and upload process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Import firebase app instance

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The public URL of the generated image after being uploaded to Firebase Storage."
    ),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    // 1. Generate the image using the AI model
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Failed to generate image. No media URL returned.');
    }

    // 2. Upload the generated image (Data URI) to Firebase Storage
    if (!app) {
        throw new Error("Firebase has not been initialized. Cannot upload to Storage.");
    }
    const storage = getStorage(app);
    const storageRef = ref(storage, `articles/images/${Date.now()}-${input.prompt.substring(0, 20)}.png`);
    
    // The media.url is the Data URI (e.g., 'data:image/png;base64,iVBORw...').
    // We upload it directly to Firebase Storage.
    const snapshot = await uploadString(storageRef, media.url, 'data_url');
    
    // 3. Get the public download URL from Firebase Storage
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 4. Return the public URL
    return {imageUrl: downloadURL};
  }
);
