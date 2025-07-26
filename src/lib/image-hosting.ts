
'use server';

const FREEIMAGE_API_KEY = '6d207e02198a847aa98d0a2a901485a5';
const FREEIMAGE_API_URL = 'https://freeimage.host/api/1/upload';

/**
 * Mengunggah gambar dalam format data URI ke layanan freeimage.host.
 * @param dataUri - Gambar yang akan diunggah, dalam format data URI (misal: 'data:image/png;base64,iVBORw...').
 * @returns URL publik dari gambar yang diunggah.
 * @throws Akan melempar error jika unggahan gagal atau respons dari API tidak valid.
 */
export async function uploadImageToFreeImage(dataUri: string): Promise<string> {
  // Ekstrak konten base64 dari data URI.
  const base64Data = dataUri.split(',')[1];
  if (!base64Data) {
    throw new Error('Data URI tidak valid atau tidak berisi konten base64.');
  }
  
  const imageBuffer = Buffer.from(base64Data, 'base64');
  
  try {
    const formData = new FormData();
    formData.append('key', FREEIMAGE_API_KEY);
    // 'source' is the field name for the image data for freeimage.host
    formData.append('source', new Blob([imageBuffer]), 'image.png');
    formData.append('format', 'json');

    const response = await fetch(FREEIMAGE_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal mengunggah gambar: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    if (result.status_code === 200 && result.image?.url) {
      return result.image.url;
    } else {
      throw new Error(`Respons API tidak valid: ${JSON.stringify(result)}`);
    }
  } catch (error: any) {
    console.error('Error saat mengunggah ke freeimage.host:', error);
    throw new Error(`Gagal mengunggah gambar ke hosting: ${error.message}`);
  }
}
