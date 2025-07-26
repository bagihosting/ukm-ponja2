
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy, Link as LinkIcon } from 'lucide-react';
import { uploadImageToFreeImage } from '@/lib/image-hosting';

export default function GalleryPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
       // Batasi ukuran file (misal 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Terlalu Besar',
          description: 'Ukuran gambar tidak boleh melebihi 10MB.',
        });
        return;
      }
      setSelectedFile(file);
      setUploadedImageUrl(null);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada File',
        description: 'Silakan pilih file gambar terlebih dahulu.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const dataUri = await fileToDataUri(selectedFile);
      const publicUrl = await uploadImageToFreeImage(dataUri);
      setUploadedImageUrl(publicUrl);
      toast({
        title: 'Berhasil!',
        description: 'Gambar berhasil diunggah.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengunggah',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCopyUrl = () => {
    if (!uploadedImageUrl) return;
    navigator.clipboard.writeText(uploadedImageUrl).then(() => {
      toast({
        title: 'Berhasil Disalin',
        description: 'URL gambar telah disalin ke clipboard.',
      });
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Galeri Gambar</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unggah Gambar Baru</CardTitle>
          <CardDescription>Pilih gambar dari komputer Anda untuk diunggah ke hosting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="picture">Gambar</Label>
            <Input id="picture" type="file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleFileChange} />
          </div>

          {selectedFile && (
             <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                File terpilih: <span className="font-medium text-foreground">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
               <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Unggah Gambar
                  </>
                )}
              </Button>
            </div>
          )}
          
          {uploadedImageUrl && (
            <div className="space-y-4 pt-4 border-t">
               <h3 className="font-semibold">Hasil Unggahan:</h3>
               <div className="aspect-video relative overflow-hidden rounded-md border max-w-lg">
                <img
                  src={uploadedImageUrl}
                  alt="Gambar yang diunggah"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-4">
                  <div className="relative w-full max-w-lg">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      readOnly
                      value={uploadedImageUrl}
                      className="w-full pl-10 bg-muted"
                    />
                  </div>
                   <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Salin URL</span>
                  </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
