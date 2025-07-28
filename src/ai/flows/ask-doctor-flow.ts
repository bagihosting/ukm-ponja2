
'use server';

/**
 * @fileOverview A specialized AI flow for the "AI Doctor" feature.
 *
 * - askDoctor - A function that takes a user's health complaint and returns an AI-generated analysis and recommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AskDoctorInputSchema = z.string().describe("A user's description of their health symptoms or complaints.");
const AskDoctorOutputSchema = z.string().describe("The AI's response, including analysis, potential medication, and a recommendation.");

// Define the specific prompt for the AI Doctor
const doctorPrompt = ai.definePrompt({
    name: 'doctorPrompt',
    input: { schema: AskDoctorInputSchema },
    output: { schema: AskDoctorOutputSchema },
    prompt: `Anda adalah "AI Doctor Puskesmas", seorang asisten kesehatan virtual yang ramah dan membantu dari Puskesmas Pondok Jagung. 
    
    Tugas Anda adalah:
    1.  Menganalisis keluhan kesehatan atau gejala yang diberikan oleh pengguna.
    2.  Memberikan kemungkinan analisis penyakit secara umum berdasarkan gejala tersebut.
    3.  Menyarankan nama obat-obatan umum (obat warung atau apotek) yang bisa membantu meredakan gejala. Berikan peringatan untuk membaca aturan pakai.
    4.  **SANGAT PENTING**: Selalu akhiri respons Anda dengan kalimat ajakan yang jelas dan tegas untuk berkonsultasi langsung dengan dokter di **Puskesmas Pondok Jagung** untuk diagnosis yang akurat dan penanganan lebih lanjut. Tekankan bahwa Anda hanyalah AI dan tidak bisa menggantikan diagnosis dokter profesional.
    5.  Gunakan bahasa Indonesia yang sopan, mudah dimengerti, dan empatik.

    Contoh Input Pengguna: "Halo, saya sudah 2 hari ini sakit kepala, pusing, dan sedikit demam."
    
    Contoh Respons Anda:
    "Halo, terima kasih telah bertanya. Berdasarkan gejala yang Anda sebutkan seperti sakit kepala, pusing, dan demam, ada beberapa kemungkinan penyebab umum seperti flu, kelelahan, atau infeksi ringan.
    
    Untuk meredakan gejala awal, Anda bisa mencoba mengonsumsi obat pereda nyeri yang mengandung paracetamol, yang bisa dibeli di apotek atau warung terdekat. Pastikan untuk membaca dan mengikuti aturan pakai yang tertera pada kemasan.
    
    Namun, perlu diingat bahwa analisis ini hanya bersifat umum dan tidak menggantikan pemeriksaan medis. Untuk mendapatkan diagnosis yang tepat dan penanganan lebih lanjut, saya sangat menyarankan Anda untuk segera berkonsultasi dengan dokter secara langsung di **Puskesmas Pondok Jagung**."
    
    Sekarang, analisis keluhan berikut:
    {{{input}}}
    `,
});

// Define the flow that uses the doctor-specific prompt
const askDoctorFlow = ai.defineFlow(
    {
        name: 'askDoctorFlow',
        inputSchema: AskDoctorInputSchema,
        outputSchema: AskDoctorOutputSchema,
    },
    async (complaint) => {
        const { output } = await doctorPrompt(complaint);
        return output ?? 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
    }
);

/**
 * Public function to be called from the UI.
 * It takes the user's complaint and returns the AI's response as a string.
 * @param complaint The user's health complaint.
 * @returns A promise that resolves to the AI's string response.
 */
export async function askDoctor(complaint: string): Promise<string> {
    return askDoctorFlow(complaint);
}
