
'use server';
/**
 * @fileOverview A flow for generating images from a text prompt for the gallery.
 *
 * - generateAndSaveGalleryImage - A function that generates an image, uploads it, and saves the record to Firestore.
 * - GenerateGalleryImageInput - The input type for the function.
 * - GenerateGalleryImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { uploadImageToFreeImage } from '@/lib/image-hosting';
import { addGalleryImageRecord } from '@/lib/gallery';
import { z } from 'genkit';

const GenerateGalleryImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateGalleryImageInput = z.infer<typeof GenerateGalleryImageInputSchema>;

const GenerateGalleryImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The public URL of the generated and hosted image.'),
  imageId: z.string().describe('The ID of the image record in Firestore.'),
});
export type GenerateGalleryImageOutput = z.infer<typeof GenerateGalleryImageOutputSchema>;

export async function generateAndSaveGalleryImage(
  input: GenerateGalleryImageInput
): Promise<GenerateGalleryImageOutput> {
  return generateGalleryImageFlow(input);
}

const generateGalleryImageFlow = ai.defineFlow(
  {
    name: 'generateGalleryImageFlow',
    inputSchema: GenerateGalleryImageInputSchema,
    outputSchema: GenerateGalleryImageOutputSchema,
  },
  async ({ prompt }) => {
    // 1. Generate the image using the AI model
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

    // 2. Upload the generated image to the external hosting service
    const publicUrl = await uploadImageToFreeImage(imageDataUri);

    // 3. Save the image metadata to Firestore
    const imageName = `${prompt.substring(0, 30).replace(/\s/g, '_')}_${Date.now()}.png`;
    const newImageRecord = {
      name: imageName,
      url: publicUrl,
    };
    
    const imageId = await addGalleryImageRecord(newImageRecord);
    
    return { 
        imageUrl: publicUrl,
        imageId: imageId
    };
  }
);
