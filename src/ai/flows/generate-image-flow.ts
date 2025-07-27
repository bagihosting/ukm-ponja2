
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


const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  dataUri: z.string().describe("The generated image as a data URI, including a MIME type and Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(
  input: GenerateImageInput
): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const imagePrompt = ai.definePrompt({
  name: 'generateImagePrompt',
  input: { schema: GenerateImageInputSchema },
  prompt: `Buat gambar yang fotorealistik dan berkualitas tinggi berdasarkan deskripsi berikut: {{{prompt}}}. Penting: Jika gambar menampilkan orang, pastikan mereka memiliki wajah dan penampilan khas orang Indonesia untuk konsistensi.`
});

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    
    const renderedPrompt = await imagePrompt.render(input);
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: renderedPrompt.prompt,
    });

    const dataUri = media.url;
    if (!dataUri) {
      throw new Error('Gagal membuat gambar. Tidak ada data yang diterima.');
    }
    
    return { dataUri };
  }
);
