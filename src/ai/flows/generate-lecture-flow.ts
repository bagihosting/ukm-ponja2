
'use server';

/**
 * @fileOverview An AI flow to act as a "Smart Lecturer" (Dosen Pintar).
 * 
 * - generateLecture - A function that takes a topic and returns a structured, in-depth explanation.
 * - GenerateLectureInput - The input type for the generateLecture function.
 * - GenerateLectureOutput - The return type for the generateLecture function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

// Schema for the input data
const GenerateLectureInputSchema = z.object({
  topic: z.string().describe('The main topic or concept the user wants to understand.'),
});
export type GenerateLectureInput = z.infer<typeof GenerateLectureInputSchema>;

// Schema for the output data
const GenerateLectureOutputSchema = z.object({
  explanation: z.string().describe('The full, structured, and in-depth explanation of the topic, as delivered by a smart lecturer.'),
});
export type GenerateLectureOutput = z.infer<typeof GenerateLectureOutputSchema>;


/**
 * Public function to be called from the UI.
 * It takes a topic and returns the generated explanation.
 * @param {GenerateLectureInput} input The topic for the lecture.
 * @returns {Promise<GenerateLectureOutput>} A promise that resolves to the generated explanation object.
 */
export async function generateLecture(input: GenerateLectureInput): Promise<GenerateLectureOutput> {
  return generateLectureFlow(input);
}


// Define the prompt for the AI to generate the lecture
const lecturePrompt = ai.definePrompt({
  name: 'lecturePrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: GenerateLectureInputSchema },
  output: { schema: GenerateLectureOutputSchema },
  prompt: `Anda adalah "AI Dosen Pintar", seorang ahli virtual yang sangat kompeten dalam menjelaskan berbagai macam topik.
  Tugas Anda adalah memberikan penjelasan yang mendalam, terstruktur, dan mudah dipahami mengenai topik yang diberikan oleh pengguna.

  **Struktur Penjelasan Anda Harus Mengikuti Format Berikut:**
  
  1.  **Judul Penjelasan**: Mulai dengan judul yang jelas dan relevan dengan topik.
  
  2.  **Konsep Dasar**: Jelaskan konsep fundamental dari topik tersebut dalam satu atau dua paragraf singkat. Anggap pembaca adalah pemula.
  
  3.  **Poin-Poin Penting**: Uraikan topik menjadi 3-4 poin atau sub-bagian utama.
      - Gunakan sub-judul yang jelas untuk setiap poin.
      - Jelaskan setiap poin secara rinci.
      - Berikan contoh nyata atau studi kasus singkat untuk setiap poin agar lebih mudah dimengerti.
      
  4.  **Analogi Sederhana**: Akhiri penjelasan dengan sebuah analogi yang membantu menyederhanakan konsep yang kompleks tersebut.
  
  **Gaya Bahasa**:
  - Gunakan bahasa Indonesia yang formal namun tetap menarik dan tidak kaku.
  - Hindari jargon yang tidak perlu, atau jelaskan jika memang harus digunakan.
  - Pastikan penjelasan Anda koheren dan logis.

  **Topik yang Harus Dijelaskan**: {{{topic}}}
  
  Sekarang, berikan penjelasan lengkap sesuai dengan struktur di atas.
  `,
});

// Define the flow that orchestrates the generation process
const generateLectureFlow = ai.defineFlow(
  {
    name: 'generateLectureFlow',
    inputSchema: GenerateLectureInputSchema,
    outputSchema: GenerateLectureOutputSchema,
  },
  async (input) => {
    // Call the prompt with the user's input
    const { output } = await lecturePrompt(input);

    if (!output) {
      throw new Error('Gagal menghasilkan penjelasan dari AI.');
    }

    return output;
  }
);
