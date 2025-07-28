
'use server';

/**
 * @fileOverview An AI flow to generate presentation slide content from a topic.
 * 
 * - generateSlides - A function that takes a topic and returns an array of structured slide objects.
 * - GenerateSlidesInput - The input type for the generateSlides function.
 * - GenerateSlidesOutput - The return type for the generateSlides function.
 * - Slide - The type for a single slide object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

// Schema for the input data
const GenerateSlidesInputSchema = z.object({
  topic: z.string().describe('The main topic for the presentation.'),
});
export type GenerateSlidesInput = z.infer<typeof GenerateSlidesInputSchema>;

// Schema for a single slide
const SlideSchema = z.object({
  title: z.string().describe('The title of the slide.'),
  content: z.array(z.string()).describe('An array of bullet points for the main content of the slide. Each string is a separate point.'),
  speakerNotes: z.string().describe('Notes for the presenter for this specific slide.'),
});
export type Slide = z.infer<typeof SlideSchema>;

// Schema for the output data
const GenerateSlidesOutputSchema = z.object({
  slides: z.array(SlideSchema).describe('An array of slide objects that make up the presentation.'),
});
export type GenerateSlidesOutput = z.infer<typeof GenerateSlidesOutputSchema>;


/**
 * Public function to be called from the UI.
 * It takes a topic and returns the generated presentation content.
 * @param {GenerateSlidesInput} input The topic for the presentation.
 * @returns {Promise<GenerateSlidesOutput>} A promise that resolves to the generated slides object.
 */
export async function generateSlides(input: GenerateSlidesInput): Promise<GenerateSlidesOutput> {
  return generateSlidesFlow(input);
}


// Define the prompt for the AI to generate the presentation content
const slidesPrompt = ai.definePrompt({
  name: 'slidesPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: GenerateSlidesInputSchema },
  output: { schema: GenerateSlidesOutputSchema },
  prompt: `Anda adalah seorang ahli strategi konten dan desainer instruksional.
  Tugas Anda adalah membuat kerangka konten untuk sebuah presentasi (seperti PowerPoint atau Google Slides) berdasarkan topik yang diberikan.
  Buat presentasi yang logis, mengalir, dan mudah dipahami.

  **Instruksi Penting:**
  1.  **Struktur Presentasi**: Buat antara 5 hingga 8 slide.
      - **Slide 1: Judul**: Judul yang menarik dan subjudul singkat.
      - **Slide 2: Agenda/Pendahuluan**: Poin-poin utama yang akan dibahas.
      - **Slide 3-6: Isi Utama**: Kembangkan setiap poin utama menjadi slide terpisah. Gunakan poin-poin (bullet points) yang jelas dan ringkas.
      - **Slide Terakhir: Kesimpulan & Q&A**: Rangkuman singkat dan ajakan untuk bertanya.
  2.  **Konten Slide**: Untuk setiap slide, berikan:
      - `title`: Judul yang jelas untuk slide tersebut.
      - `content`: Array berisi poin-poin utama. Setiap poin harus singkat dan padat.
      - `speakerNotes`: Catatan untuk pembicara, memberikan detail atau konteks tambahan untuk setiap slide.
  3.  **Gaya Bahasa**: Gunakan bahasa Indonesia yang profesional namun mudah dipahami.

  **Topik Presentasi**: {{{topic}}}
  
  Sekarang, buatkan konten presentasi berdasarkan topik tersebut.
  `,
});

// Define the flow that orchestrates the generation process
const generateSlidesFlow = ai.defineFlow(
  {
    name: 'generateSlidesFlow',
    inputSchema: GenerateSlidesInputSchema,
    outputSchema: GenerateSlidesOutputSchema,
  },
  async (input) => {
    // Call the prompt with the user's input
    const { output } = await slidesPrompt(input);

    if (!output || !output.slides || output.slides.length === 0) {
      throw new Error('Gagal menghasilkan konten presentasi dari AI.');
    }

    return output;
  }
);
