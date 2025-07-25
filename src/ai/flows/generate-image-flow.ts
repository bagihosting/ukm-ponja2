
'use server';
/**
 * @fileOverview A flow for generating images from a text prompt.
 *
 * - generateImage - A function that generates an image based on a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { uploadImageFromDataUri } from '@/lib/storage';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .url()
    .describe('The URL of the generated image hosted on Firebase Storage.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(
  input: GenerateImageInput
): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Buat gambar yang fotorealistik dan berkualitas tinggi berdasarkan deskripsi berikut: ${prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageDataUri = media.url;
    if (!imageDataUri) {
      throw new Error('Gagal membuat gambar. Tidak ada data yang diterima.');
    }

    try {
      const imageUrl = await uploadImageFromDataUri(imageDataUri);
      return { imageUrl };
    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
      throw new Error('Gagal mengunggah gambar ke Firebase Storage.');
    }
  }
);
