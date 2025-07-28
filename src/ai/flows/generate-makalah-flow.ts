
'use server';

/**
 * @fileOverview An AI flow to generate a simple academic paper or article.
 * 
 * - generateMakalah - A function that takes a title and a topic and returns a structured paper.
 * - GenerateMakalahInput - The input type for the generateMakalah function.
 * - GenerateMakalahOutput - The return type for the generateMakalah function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

// Schema for the input data
const GenerateMakalahInputSchema = z.object({
  title: z.string().describe('The main title of the paper.'),
  topic: z.string().describe('A brief description or the main topic of the paper.'),
});
export type GenerateMakalahInput = z.infer<typeof GenerateMakalahInputSchema>;

// Schema for the output data
const GenerateMakalahOutputSchema = z.object({
  makalahContent: z.string().describe('The full, structured content of the generated paper.'),
});
export type GenerateMakalahOutput = z.infer<typeof GenerateMakalahOutputSchema>;


/**
 * Public function to be called from the UI.
 * It takes a title and topic and returns the generated paper content.
 * @param {GenerateMakalahInput} input The title and topic for the paper.
 * @returns {Promise<GenerateMakalahOutput>} A promise that resolves to the generated paper object.
 */
export async function generateMakalah(input: GenerateMakalahInput): Promise<GenerateMakalahOutput> {
  return generateMakalahFlow(input);
}


// Define the prompt for the AI to generate the paper
const makalahPrompt = ai.definePrompt({
  name: 'makalahPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: GenerateMakalahInputSchema },
  output: { schema: GenerateMakalahOutputSchema },
  prompt: `Anda adalah seorang asisten penulis akademik yang cerdas dan terstruktur.
  Tugas Anda adalah membuat draf makalah atau artikel dalam bahasa Indonesia berdasarkan judul dan topik yang diberikan.

  Gunakan format penulisan yang jelas dan terstruktur. Susun makalah dengan urutan berikut:
  
  1.  **PENDAHULUAN**: Berikan pengantar singkat mengenai topik, latar belakang masalah, dan tujuan dari penulisan makalah ini.
  
  2.  **PEMBAHASAN**:
      - Buatlah 2 hingga 3 sub-judul yang relevan dengan topik utama.
      - Jelaskan setiap poin di bawah sub-judul tersebut secara rinci dan jelas. Gunakan data atau contoh jika memungkinkan (Anda bisa membuatnya secara hipotetis jika tidak ada data nyata).
      - Pastikan alur antar paragraf mengalir dengan baik.
      
  3.  **KESIMPULAN**: Rangkum poin-poin utama dari pembahasan dan berikan kesimpulan akhir atau rekomendasi singkat.

  **ATURAN PENTING**:
  - Gunakan bahasa Indonesia yang formal dan baku.
  - Jangan menambahkan header atau footer.
  - Hasil akhir harus berupa teks mentah (plain text) yang siap untuk disalin.

  Berikut adalah detail untuk makalah yang harus Anda buat:
  
  **Judul Makalah**: {{{title}}}
  
  **Topik Utama**: {{{topic}}}
  
  Sekarang, mulailah menulis makalah tersebut.
  `,
});

// Define the flow that orchestrates the generation process
const generateMakalahFlow = ai.defineFlow(
  {
    name: 'generateMakalahFlow',
    inputSchema: GenerateMakalahInputSchema,
    outputSchema: GenerateMakalahOutputSchema,
  },
  async (input) => {
    // Call the prompt with the user's input
    const { output } = await makalahPrompt(input);

    if (!output) {
      throw new Error('Gagal menghasilkan konten makalah dari AI.');
    }

    return output;
  }
);
