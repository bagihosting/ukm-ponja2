
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy } from 'lucide-react';
import { uploadImageAndCreateGalleryRecord } from '@/lib/gallery';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AppsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadedUrl(null); // Reset URL on new file selection
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Limit file size (e.g., 100MB for videos)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Terlalu Besar',
          description: 'Ukuran file tidak boleh melebihi 100MB.',
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
        description: 'Silakan pilih file untuk diunggah.',
      });
      return;
    }

    setIsUploading(true);
    setUploadedUrl(null);
    try {
      // This function already uploads to Cloudinary and saves the URL to Firestore.
      const url = await uploadImageAndCreateGalleryRecord(selectedFile, selectedFile.name);
      
      setUploadedUrl(url); // Save URL to state to display it
      
      toast({
        title: 'Berhasil!',
        description: `File "${selectedFile.name}" berhasil diunggah.`,
      });
      
      // Reset state after successful upload
      setSelectedFile(null);
      const fileInput = document.getElementById('cloudinary-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengunggah',
        description: `Terjadi kesalahan saat mengunggah: ${error.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!uploadedUrl) return;
    navigator.clipboard.writeText(uploadedUrl).then(() => {
      toast({
        title: 'Berhasil!',
        description: 'URL file telah disalin ke clipboard.',
      });
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Aplikasi & Integrasi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unggah ke Cloudinary</CardTitle>
          <CardDescription>Unggah file gambar atau video langsung ke Cloudinary. Hasilnya akan disimpan ke riwayat Galeri dan URL-nya bisa disalin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
              <Label htmlFor="cloudinary-upload">Pilih Gambar atau Video</Label>
              <div className="grid w-full max-w-sm items-center gap-2">
                <Input id="cloudinary-upload" type="file" accept="image/*,video/mp4,video/quicktime,video/webm" onChange={handleFileChange} disabled={isUploading}/>
              </div>
              {selectedFile && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      File terpilih: <span className="font-medium text-foreground">{selectedFile.name}</span> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <Button onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      {isUploading ? 'Mengunggah...' : 'Unggah ke Cloudinary'}
                    </Button>
                </div>
              )}
          </div>
          {uploadedUrl && (
             <Alert>
                <AlertTitle className="mb-2">Unggah Berhasil!</AlertTitle>
                <AlertDescription className="space-y-4">
                    <p>URL file Anda:</p>
                    <Input readOnly value={uploadedUrl} className="bg-muted"/>
                    <Button onClick={handleCopyUrl} variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Salin URL
                    </Button>
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
