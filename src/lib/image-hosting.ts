
'use server';

const FREEIMAGE_API_KEY = '6d207e02198a847aa98d0a2a901485a5';
const FREEIMAGE_API_URL = 'https://freeimage.host/api/1/upload';

/**
 * Mengunggah gambar ke layanan freeimage.host.
 * Fungsi ini dapat menerima gambar dalam format data URI atau sebagai objek File.
 * @param source - Gambar yang akan diunggah, bisa berupa string data URI atau objek File.
 * @returns URL publik dari gambar yang diunggah.
 * @throws Akan melempar error jika unggahan gagal atau respons dari API tidak valid.
 */
export async function uploadImageToFreeImage(source: string | File): Promise<string> {
  let imageBlob: Blob;
  let fileName = 'image.png';

  if (typeof source === 'string') {
    // Handle data URI
    if (!source.startsWith('data:image/')) {
        throw new Error('Invalid data URI format. Expected "data:image/...".');
    }
    const base64Data = source.split(',')[1];
    if (!base64Data) {
      throw new Error('Data URI tidak valid atau tidak berisi konten base64.');
    }
    const imageBuffer = Buffer.from(base64Data, 'base64');
    imageBlob = new Blob([imageBuffer]);
  } else {
    // Handle File object
    imageBlob = source;
    fileName = source.name;
  }
  
  try {
    const formData = new FormData();
    formData.append('key', FREEIMAGE_API_KEY);
    // 'source' is the field name for the image data for freeimage.host
    formData.append('source', imageBlob, fileName);
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
