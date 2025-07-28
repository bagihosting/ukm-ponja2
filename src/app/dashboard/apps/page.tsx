
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { uploadImageAndCreateGalleryRecord } from '@/lib/gallery';

export default function AppsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Limit file size (e.g., 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Terlalu Besar',
          description: 'Ukuran gambar tidak boleh melebihi 10MB.',
        });
        event.target.value = ''; // Clear the input
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada File',
        description: 'Silakan pilih file gambar untuk diunggah.',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Reuse the existing robust upload function
      const uploadedUrl = await uploadImageAndCreateGalleryRecord(selectedFile, selectedFile.name);
      
      toast({
        title: 'Berhasil!',
        description: `Gambar "${selectedFile.name}" berhasil diunggah.`,
      });
      
      // Reset state after successful upload
      setSelectedFile(null);
      const fileInput = document.getElementById('cloudinary-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengunggah',
        description: `Terjadi kesalahan saat mengunggah ke Cloudinary: ${error.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Aplikasi & Integrasi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unggah ke Cloudinary</CardTitle>
          <CardDescription>Unggah file gambar langsung ke Cloudinary melalui aplikasi ini. Unggahan juga akan tercatat di Galeri.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
              <Label htmlFor="cloudinary-upload">Pilih Gambar</Label>
              <div className="grid w-full max-w-sm items-center gap-2">
                <Input id="cloudinary-upload" type="file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleFileChange} disabled={isUploading}/>
              </div>
              {selectedFile && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      File terpilih: <span className="font-medium text-foreground">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                    <Button onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      {isUploading ? 'Mengunggah...' : 'Unggah ke Cloudinary'}
                    </Button>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
