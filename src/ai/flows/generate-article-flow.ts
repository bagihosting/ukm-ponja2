
'use server';

/**
 * @fileOverview An AI flow to generate a web-friendly article from a topic.
 * 
 * - generateArticle - A function that takes a topic and returns a structured article with a title and content.
 * - GenerateArticleInput - The input type for the generateArticle function.
 * - GenerateArticleOutput - The return type for the generateArticle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

// Schema for the input data
const GenerateArticleInputSchema = z.object({
  topic: z.string().describe('The main topic or a brief for the article.'),
});
export type GenerateArticleInput = z.infer<typeof GenerateArticleInputSchema>;

// Schema for the output data
const GenerateArticleOutputSchema = z.object({
  title: z.string().describe('The catchy and SEO-friendly title of the generated article.'),
  content: z.string().describe('The full, well-structured content of the generated article, written in a clear and engaging style.'),
});
export type GenerateArticleOutput = z.infer<typeof GenerateArticleOutputSchema>;


/**
 * Public function to be called from the UI.
 * It takes a topic and returns the generated article object.
 * @param {GenerateArticleInput} input The topic for the article.
 * @returns {Promise<GenerateArticleOutput>} A promise that resolves to the generated article object.
 */
export async function generateArticle(input: GenerateArticleInput): Promise<GenerateArticleOutput> {
  return generateArticleFlow(input);
}


// Define the prompt for the AI to generate the article
const articlePrompt = ai.definePrompt({
  name: 'articlePrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: GenerateArticleInputSchema },
  output: { schema: GenerateArticleOutputSchema },
  prompt: `Anda adalah seorang penulis konten kesehatan yang ahli dan berpengalaman untuk situs web.
  Tugas Anda adalah membuat artikel yang informatif, menarik, dan mudah dibaca oleh masyarakat umum berdasarkan topik yang diberikan.

  **Instruksi Penting:**
  1.  **Buat Judul yang Menarik**: Berdasarkan topik, buatlah judul yang singkat, jelas, dan menarik perhatian pembaca.
  2.  **Struktur Artikel**: Susun artikel dengan format berikut:
      - **Paragraf Pembuka**: Mulailah dengan pengantar yang mengaitkan topik dengan pembaca dan jelaskan secara singkat apa yang akan dibahas.
      - **Isi Artikel**: Kembangkan topik utama menjadi beberapa poin atau sub-bagian. Jelaskan setiap poin dengan bahasa yang sederhana dan hindari jargon medis yang rumit.
      - **Paragraf Penutup**: Akhiri dengan rangkuman singkat atau kesimpulan yang memberikan pesan utama kepada pembaca.
  3.  **Gaya Bahasa**: Gunakan bahasa Indonesia yang baik, mengalir, dan positif. Artikel harus terasa membantu dan memberikan pencerahan.

  **Topik Artikel**: {{{topic}}}
  
  Sekarang, tuliskan artikelnya.
  `,
});

// Define the flow that orchestrates the generation process
const generateArticleFlow = ai.defineFlow(
  {
    name: 'generateArticleFlow',
    inputSchema: GenerateArticleInputSchema,
    outputSchema: GenerateArticleOutputSchema,
  },
  async (input) => {
    // Call the prompt with the user's input
    const { output } = await articlePrompt(input);

    if (!output) {
      throw new Error('Gagal menghasilkan konten artikel dari AI.');
    }

    return output;
  }
);
