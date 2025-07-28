
'use server';
/**
 * @fileOverview Alur AI untuk mengkategorikan gambar.
 *
 * - categorizeImage - Fungsi yang menerima URL gambar dan mengembalikan kategori yang sesuai.
 * - CategorizeImageInput - Tipe input untuk fungsi categorizeImage.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CategorizeImageInputSchema = z.object({
  imageUrl: z.string().url().describe('URL dari gambar yang akan dikategorikan.'),
});
export type CategorizeImageInput = z.infer<typeof CategorizeImageInputSchema>;

const CATEGORIES = [
    'Penyuluhan Kesehatan',
    'Pemeriksaan Kesehatan',
    'Vaksinasi / Imunisasi',
    'Kegiatan Posyandu',
    'Senam / Olahraga Bersama',
    'Rapat / Pertemuan Internal',
    'Stok Obat / Fasilitas',
    'Lain-lain',
] as const;


const CategorizeImageOutputSchema = z.object({
    category: z.enum(CATEGORIES).describe('Kategori yang paling sesuai untuk gambar.'),
});

export async function categorizeImage(input: CategorizeImageInput): Promise<typeof CATEGORIES[number]> {
  const result = await categorizeImageFlow(input);
  return result.category;
}

const categorizeImageFlow = ai.defineFlow(
  {
    name: 'categorizeImageFlow',
    inputSchema: CategorizeImageInputSchema,
    outputSchema: CategorizeImageOutputSchema,
  },
  async (input) => {
    const prompt = `Anda adalah seorang ahli arsiparis untuk sebuah Puskesmas (Pusat Kesehatan Masyarakat) di Indonesia. Tugas Anda adalah mengkategorikan sebuah gambar berdasarkan konten visualnya.

Analisis gambar yang diberikan dan tentukan kategori mana yang paling tepat dari daftar berikut:
- Penyuluhan Kesehatan (Contoh: seminar, pembagian brosur, edukasi ke masyarakat)
- Pemeriksaan Kesehatan (Contoh: tensi darah, pemeriksaan gigi, cek gula darah)
- Vaksinasi / Imunisasi (Contoh: penyuntikan vaksin pada anak-anak atau dewasa)
- Kegiatan Posyandu (Contoh: penimbangan bayi, kegiatan di pos pelayanan terpadu)
- Senam / Olahraga Bersama (Contoh: kegiatan fisik bersama di luar ruangan)
- Rapat / Pertemuan Internal (Contoh: staf puskesmas sedang rapat di dalam ruangan)
- Stok Obat / Fasilitas (Contoh: foto rak obat, ruangan, atau peralatan medis tanpa ada kegiatan spesifik)
- Lain-lain (Gunakan ini jika tidak ada kategori lain yang cocok)

Pilih HANYA SATU kategori yang paling mewakili aktivitas utama dalam gambar.

Gambar untuk dianalisis: {{media url="${input.imageUrl}"}}`;

    const { output } = await ai.generate({
        prompt,
        output: { schema: CategorizeImageOutputSchema },
        model: 'googleai/gemini-1.5-flash-latest',
    });
    
    if (!output) {
        throw new Error("Gagal mendapatkan kategori dari AI.");
    }
    return output;
  }
);
