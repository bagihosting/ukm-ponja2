
'use server';
/**
 * @fileOverview A flow for generating images from a text prompt.
 *
 * - generateImage - A function that generates an image and returns its data URI.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { uploadImageToCloudinary } from '@/lib/image-hosting';


const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  publicUrl: z.string().url().describe('The publicly accessible URL of the generated and hosted image.'),
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
    // 1. Generate the image using the AI model
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Buat gambar yang fotorealistik dan berkualitas tinggi berdasarkan deskripsi berikut: ${prompt}. Penting: Jika gambar menampilkan orang, pastikan mereka memiliki wajah dan penampilan khas orang Indonesia untuk konsistensi.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageDataUri = media.url;
    if (!imageDataUri) {
      throw new Error('Gagal membuat gambar. Tidak ada data yang diterima.');
    }
    
    // 2. Upload the generated image data URI to get a public URL
    const publicUrl = await uploadImageToCloudinary(imageDataUri);

    // 3. Return the public URL
    return { publicUrl };
  }
);
