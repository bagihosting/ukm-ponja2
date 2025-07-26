
'use server';
/**
 * @fileOverview A flow for generating images from a text prompt and uploading them.
 *
 * - generateImage - A function that generates an image and returns its public URL.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { uploadImageToFreeImage } from '@/lib/image-hosting';
import { addGalleryImageRecord } from '@/lib/gallery';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The public URL of the generated and hosted image.'),
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

    // 2. Upload the generated image to the external hosting service
    let publicUrl: string;
    try {
      publicUrl = await uploadImageToFreeImage(imageDataUri);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Gagal mengunggah gambar yang telah dibuat.');
    }
    
    // Note: Saving to gallery is now handled by the calling functions
    // (e.g., in the gallery page or article page) to allow for more context.
    // The `addGalleryImageRecord` function will handle categorization.

    return { imageUrl: publicUrl };
  }
);
