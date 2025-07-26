
'use server';
/**
 * @fileOverview Alur untuk fitur AI Dokter.
 *
 * - askDoctor - Fungsi yang menerima pertanyaan kesehatan dan mengembalikan jawaban dari AI.
 * - AskDoctorInput - Tipe input untuk fungsi askDoctor.
 * - AskDoctorOutput - Tipe output untuk fungsi askDoctor.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AskDoctorInputSchema = z.object({
  question: z.string().describe('Pertanyaan kesehatan dari pengguna.'),
});
export type AskDoctorInput = z.infer<typeof AskDoctorInputSchema>;

const AskDoctorOutputSchema = z.object({
  answer: z.string().describe('Jawaban yang dihasilkan AI untuk pertanyaan kesehatan.'),
});
export type AskDoctorOutput = z.infer<typeof AskDoctorOutputSchema>;

export async function askDoctor(input: AskDoctorInput): Promise<AskDoctorOutput> {
  return askDoctorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askDoctorPrompt',
  input: { schema: AskDoctorInputSchema },
  output: { schema: AskDoctorOutputSchema },
  prompt: `Anda adalah seorang dokter dari Puskesmas Pondok Jagung - Tangerang Selatan. 
Sebagai asisten kesehatan virtual, tugas Anda adalah menjawab pertanyaan kesehatan dari pengguna dengan ramah, jelas, mudah dipahami, dan mendukung.

Gunakan gaya bahasa yang empatik dan profesional. 

PENTING: Selalu akhiri setiap jawaban dengan penafian berikut, dipisahkan oleh dua baris baru:
"Penafian: Informasi ini disediakan oleh AI dan tidak menggantikan saran medis profesional. Selalu konsultasikan dengan dokter atau penyedia layanan kesehatan yang berkualifikasi untuk diagnosis dan perawatan medis."

Pertanyaan Pengguna: {{{question}}}`,
});

const askDoctorFlow = ai.defineFlow(
  {
    name: 'askDoctorFlow',
    inputSchema: AskDoctorInputSchema,
    outputSchema: AskDoctorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
