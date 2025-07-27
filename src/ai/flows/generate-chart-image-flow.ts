
'use server';
/**
 * @fileOverview Alur AI untuk menghasilkan gambar grafik dari data laporan.
 *
 * - generateChartImage - Fungsi yang menerima data laporan dan menghasilkan gambar.
 * - GenerateChartImageInput - Tipe input untuk fungsi generateChartImage.
 * - GenerateChartImageOutput - Tipe output untuk fungsi generateChartImage.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateChartImageInputSchema = z.object({
  targetData: z.string().describe('Data target dalam format NAMA_PROGRAM=NILAI, dipisahkan oleh baris baru.'),
  programService: z.string().optional().describe('Nama pelayanan program untuk judul grafik.'),
  personInCharge: z.string().optional().describe('Nama penanggung jawab.'),
  period: z.string().optional().describe('Periode laporan.'),
});
export type GenerateChartImageInput = z.infer<typeof GenerateChartImageInputSchema>;

const GenerateChartImageOutputSchema = z.object({
  dataUri: z.string().describe("Gambar yang dihasilkan sebagai data URI, format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateChartImageOutput = z.infer<typeof GenerateChartImageOutputSchema>;

export async function generateChartImage(
  input: GenerateChartImageInput
): Promise<GenerateChartImageOutput> {
  return generateChartImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChartImagePrompt',
  input: { schema: GenerateChartImageInputSchema },
  // Note: The output schema is for our flow's final result, not the direct model output.
  // The model itself will just return an image, which we process.
  prompt: `Anda adalah seorang desainer grafis AI yang ahli dalam visualisasi data. Tugas Anda adalah membuat gambar grafik batang horizontal yang bersih, profesional, dan mudah dibaca berdasarkan data yang diberikan.

Instruksi Desain:
1.  **Jenis Grafik**: Buat grafik batang horizontal (horizontal bar chart).
2.  **Latar Belakang**: Gunakan latar belakang putih bersih atau sangat terang (off-white).
3.  **Palet Warna**: Gunakan palet warna biru dan hijau yang modern dan profesional untuk batang grafik. Warna harus konsisten.
4.  **Label**: Setiap batang harus memiliki label yang jelas di sumbu Y (kiri) yang menampilkan nama program. Nilai data harus ditampilkan dengan jelas di ujung kanan setiap batang.
5.  **Judul**: Gunakan informasi dari 'Pelayanan Program' dan 'Periode' untuk membuat judul yang informatif. Contoh Judul: "Laporan Target Tahunan: {{programService}} (Periode: {{period}})". Jika data tidak tersedia, buat judul umum seperti "Laporan Target Tahunan".
6.  **Font**: Gunakan font sans-serif yang modern dan mudah dibaca (seperti Inter, Helvetica, atau Arial).
7.  **Komposisi**: Pastikan ada cukup ruang (padding) di sekitar grafik. Jangan membuat elemen terlalu padat.
8.  **Output**: Gambar harus berkualitas tinggi dan dalam format PNG.

Data untuk Grafik:
- **Judul Program/Pelayanan**: {{{programService}}}
- **Periode**: {{{period}}}
- **Penanggung Jawab**: {{{personInCharge}}}
- **Data Target**:
{{{targetData}}}

Berdasarkan data dan instruksi di atas, buatlah gambar grafik yang sesuai.`,
});


const generateChartImageFlow = ai.defineFlow(
  {
    name: 'generateChartImageFlow',
    inputSchema: GenerateChartImageInputSchema,
    outputSchema: GenerateChartImageOutputSchema,
  },
  async (input) => {
    // Correctly render the prompt with the input data first.
    const renderedPrompt = await prompt.render({ input });

    // Then, pass the rendered prompt to the generation model.
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: renderedPrompt,
    });

    const dataUri = media.url;
    if (!dataUri) {
      throw new Error('Gagal membuat gambar. Tidak ada data yang diterima.');
    }
    
    return { dataUri };
  }
);
