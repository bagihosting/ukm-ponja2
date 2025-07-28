
'use server';
/**
 * @fileOverview An AI flow to generate a health promotion banner.
 *
 * - generateBanner - A function that takes a text prompt and generates a health-themed banner image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { uploadImageToCloudinary } from '@/lib/image-hosting';
import { addGalleryImageRecord } from '@/lib/gallery';

const GenerateBannerInputSchema = z.object({
  prompt: z.string().describe('A text description of the banner to generate.'),
});

const GenerateBannerOutputSchema = z.object({
  imageUrl: z.string().url().describe('The data URI of the generated banner image.'),
  cloudinaryUrl: z.string().url().optional().describe('The permanent Cloudinary URL of the generated banner.'),
});

export type GenerateBannerOutput = z.infer<typeof GenerateBannerOutputSchema>;

/**
 * Main flow for generating a health promotion banner.
 * It takes a user prompt, generates an image, uploads it, and saves it to the gallery.
 * @param {string} prompt The user's text prompt for the banner topic.
 * @returns {Promise<GenerateBannerOutput>} The data URI and optional Cloudinary URL.
 */
export async function generateBanner(prompt: string): Promise<GenerateBannerOutput> {
  return generateBannerFlow({ prompt });
}

const generateBannerFlow = ai.defineFlow(
  {
    name: 'generateBannerFlow',
    inputSchema: GenerateBannerInputSchema,
    outputSchema: GenerateBannerOutputSchema,
  },
  async ({ prompt }) => {
    // 1. Generate the banner image using the specified model and a tailored prompt
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A vibrant, professional, and engaging promotional banner for a health campaign about: "${prompt}". The banner should feature positive imagery, be visually appealing, and have some clear space suitable for text overlays. The style should be modern and clean. Aspect ratio 16:9.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // Explicitly set aspect ratio if model supports it
        // Note: As of now, this might be controlled more by the prompt text.
      },
    });

    const imageUrl = media?.url;
    if (!imageUrl) {
      throw new Error('Image generation failed to return a valid banner image.');
    }
    
    // 2. Upload to Cloudinary and save to gallery
    try {
        const cloudinaryUrl = await uploadImageToCloudinary(imageUrl);
        await addGalleryImageRecord({
            name: `AI Banner: ${prompt.substring(0, 50)}`,
            url: cloudinaryUrl,
            category: 'Gambar',
            fileType: 'image/png',
        });

        return { imageUrl, cloudinaryUrl };

    } catch (uploadError) {
        console.error("Cloudinary upload failed for banner, returning only the data URI:", uploadError);
        // If upload fails, still return the generated image data URI to the client
        return { imageUrl };
    }
  }
);
