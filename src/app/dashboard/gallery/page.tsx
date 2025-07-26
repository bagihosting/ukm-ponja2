
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy } from 'lucide-react';
import { uploadImageToFreeImage } from '@/lib/image-hosting';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UploadedImage {
  url: string;
  name: string;
  date: Date;
}

export default function GalleryPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
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
        event.target.value = ''; // Reset input file
        return;
      }
      setSelectedFile(file);
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
      
      const newImage: UploadedImage = {
        url: publicUrl,
        name: selectedFile.name,
        date: new Date(),
      };
      
      setUploadedImages(prevImages => [newImage, ...prevImages]);

      toast({
        title: 'Berhasil!',
        description: `Gambar "${selectedFile.name}" berhasil diunggah.`,
      });

      setSelectedFile(null);
      // Reset input file secara programmatic
      const fileInput = document.getElementById('picture') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

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
  
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Unggah Gambar Baru</CardTitle>
            <CardDescription>Pilih gambar dari komputer Anda untuk diunggah.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="picture">Gambar</Label>
              <Input id="picture" type="file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleFileChange} disabled={isUploading}/>
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
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Hasil Unggahan</CardTitle>
            <CardDescription>Daftar gambar yang telah Anda unggah.</CardDescription>
          </CardHeader>
          <CardContent>
             {uploadedImages.length > 0 ? (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Gambar</TableHead>
                                <TableHead>Nama File</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead className="text-right">Tindakan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uploadedImages.map((image) => (
                                <TableRow key={image.url}>
                                    <TableCell>
                                        <img src={image.url} alt={image.name} className="h-12 w-12 object-cover rounded-md" />
                                    </TableCell>
                                    <TableCell className="font-medium truncate max-w-[200px]">{image.name}</TableCell>
                                    <TableCell>{image.date.toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="icon" onClick={() => handleCopyUrl(image.url)}>
                                            <Copy className="h-4 w-4" />
                                            <span className="sr-only">Salin URL</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
             ) : (
                <div className="text-center text-muted-foreground py-8">
                    Belum ada gambar yang diunggah.
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
