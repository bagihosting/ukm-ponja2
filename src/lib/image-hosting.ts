
'use server';

import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

let isCloudinaryConfigured = false;

// Check if all necessary Cloudinary env vars are present.
if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
    isCloudinaryConfigured = true;
} else {
    // This warning will appear in the server console during build or runtime.
    console.warn(
      '[Cloudinary Warning] Cloudinary configuration is missing. Image uploads will fail. ' +
      'Please set CLOUDINARY_URL in your .env file.'
    );
}

/**
 * Uploads an image to Cloudinary.
 * This function can accept an image as a data URI string or a File object.
 * @param source The image source, which can be a data URI string or a File object.
 * @returns The secure URL of the uploaded image.
 * @throws Will throw an error if the upload fails or the API response is invalid.
 */
export async function uploadImageToCloudinary(source: string | File): Promise<string> {
  // Ensure Cloudinary is configured before attempting to upload
  if (!isCloudinaryConfigured) {
      throw new Error('Cloudinary is not configured. Please check your environment variables. Cannot upload image.');
  }

  try {
    let fileToUpload: string;

    // If the source is a File object, convert it to a data URI first.
    // This is necessary because this server action can be called from client components.
    if (source instanceof File) {
        const buffer = await source.arrayBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        const mimeType = source.type;
        fileToUpload = `data:${mimeType};base64,${base64String}`;
    } else if (typeof source === 'string' && source.startsWith('data:')) {
        fileToUpload = source;
    } else {
        throw new Error('Invalid image source. Must be a data URI or a File object.');
    }
    
    const result: UploadApiResponse = await cloudinary.uploader.upload(fileToUpload, {
      folder: 'ukm-ponja-app', // Optional: organize uploads into a specific folder
      resource_type: 'auto',
    });

    if (result && result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error(`Cloudinary API response was invalid: ${JSON.stringify(result)}`);
    }
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    // Provide a more user-friendly error message
    const errorMessage = error.message || 'An unknown error occurred during the upload.';
    throw new Error(`Failed to upload image to Cloudinary: ${errorMessage}`);
  }
}
