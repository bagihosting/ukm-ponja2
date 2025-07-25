'use server';
/**
 * @fileOverview A flow to generate an image from a text prompt.
 *
 * - generateImage - A function that generates an image based on a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.string().describe('The text prompt for image generation.');
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.string().describe('The data URI of the generated image.');
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(prompt: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(prompt);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (prompt) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Buat gambar untuk artikel berita dengan judul: "${prompt}". Gambar harus relevan dengan kesehatan anak, imunisasi, atau topik puskesmas.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return media.url;
  }
);
