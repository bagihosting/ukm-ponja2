
'use server';
/**
 * @fileOverview A text-to-image generation flow using Genkit.
 *
 * - generateHealthImage - A function that takes a text prompt and generates a health-themed image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { uploadImageToCloudinary } from '@/lib/image-hosting';
import { addGalleryImageRecord } from '@/lib/gallery';

const GenerateHealthImageInputSchema = z.object({
  prompt: z.string().describe('A text description of the image to generate.'),
});

const GenerateHealthImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The data URI of the generated image.'),
  cloudinaryUrl: z.string().url().optional().describe('The permanent Cloudinary URL of the generated image.'),
});

export type GenerateHealthImageOutput = z.infer<typeof GenerateHealthImageOutputSchema>;

/**
 * Main flow for generating a health-themed image.
 * It takes a user prompt, generates an image using an AI model,
 * uploads it to Cloudinary, and saves it to the gallery.
 * @param {string} prompt The user's text prompt.
 * @returns {Promise<GenerateHealthImageOutput>} The data URI and optional Cloudinary URL.
 */
export async function generateHealthImage(prompt: string): Promise<GenerateHealthImageOutput> {
  return generateHealthImageFlow({ prompt });
}

const generateHealthImageFlow = ai.defineFlow(
  {
    name: 'generateHealthImageFlow',
    inputSchema: GenerateHealthImageInputSchema,
    outputSchema: GenerateHealthImageOutputSchema,
  },
  async ({ prompt }) => {
    // 1. Generate the image using the specified model
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A high-quality, photorealistic, professional health-themed image of: ${prompt}. Focus on medical, health, and wellness concepts.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageUrl = media?.url;
    if (!imageUrl) {
      throw new Error('Image generation failed to return a valid image.');
    }
    
    // 2. Upload to Cloudinary and save to gallery
    try {
        const cloudinaryUrl = await uploadImageToCloudinary(imageUrl);
        await addGalleryImageRecord({
            name: `AI Generated: ${prompt.substring(0, 50)}`,
            url: cloudinaryUrl,
            category: 'Gambar',
            fileType: 'image/png',
        });

        return { imageUrl, cloudinaryUrl };

    } catch (uploadError) {
        console.error("Cloudinary upload failed, returning only the data URI:", uploadError);
        // If upload fails, still return the generated image data URI to the client
        return { imageUrl };
    }
  }
);
