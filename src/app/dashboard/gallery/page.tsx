
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy, Trash2, MoreHorizontal, Video, Image as ImageIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getGalleryImages, deleteGalleryImage, uploadImageAndCreateGalleryRecord, type GalleryImage } from '@/lib/gallery';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function GalleryPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const { toast } = useToast();

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedImages = await getGalleryImages();
      const sortedImages = fetchedImages.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setImages(sortedImages);
    } catch (error: any) {
      console.error("Failed to fetch images:", error);
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Riwayat Media',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          variant: 'destructive',
          title: 'File Terlalu Besar',
          description: 'Ukuran file tidak boleh melebihi 100MB.',
        });
        event.target.value = '';
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
        description: 'Silakan pilih file gambar atau video terlebih dahulu.',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Use the centralized function
      await uploadImageAndCreateGalleryRecord(selectedFile, selectedFile.name);
      
      toast({
        title: 'Berhasil!',
        description: `Media "${selectedFile.name}" berhasil diunggah dan disimpan.`,
      });
      
      await fetchImages(); // Refresh the list
      
      // Reset the file input
      setSelectedFile(null);
      const fileInput = document.getElementById('picture') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

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
        title: 'Berhasil!',
        description: 'URL media telah disalin ke clipboard.',
      });
    });
  };

  const handleDeleteClick = (image: GalleryImage) => {
    setImageToDelete(image);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      await deleteGalleryImage(imageToDelete.id);
      setImages(images.filter((image) => image.id !== imageToDelete.id));
      toast({
        title: 'Berhasil!',
        description: 'Riwayat media telah berhasil dihapus.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus',
        description: 'Terjadi kesalahan saat menghapus riwayat media: ' + err.message,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };


  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Galeri</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-1/2 flex-shrink-0">
          <CardHeader>
            <CardTitle>Unggah Media</CardTitle>
            <CardDescription>Unggah gambar atau video secara manual. Media akan dikategorikan secara otomatis dan disimpan ke riwayat galeri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="picture">Unggah Manual</Label>
                <div className="grid w-full max-w-sm items-center gap-2">
                <Input id="picture" type="file" accept="image/*,video/mp4,video/quicktime,video/webm" onChange={handleFileChange} disabled={isUploading}/>
                </div>
                {selectedFile && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                    File terpilih: <span className="font-medium text-foreground">{selectedFile.name}</span> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {isUploading ? 'Mengunggah...' : 'Unggah & Simpan'}
                    </Button>
                </div>
                )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:w-1/2 flex-grow">
          <CardHeader>
            <CardTitle>Riwayat Media</CardTitle>
            <CardDescription>Daftar gambar dan video yang riwayatnya tersimpan, beserta kategorinya.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-8">
                    <p className="font-semibold">Gagal memuat riwayat media.</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            ) : images.length > 0 ? (
                <div className="border rounded-md max-h-[400px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Media</TableHead>
                                <TableHead>Nama File & Kategori</TableHead>
                                <TableHead className="text-right">Tindakan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {images.map((image) => (
                                <TableRow key={image.id}>
                                    <TableCell>
                                      <div className="h-12 w-12 object-cover rounded-md bg-muted flex items-center justify-center">
                                        {image.category === 'Gambar' ? (
                                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        ) : (
                                          <Video className="h-6 w-6 text-muted-foreground" />
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium truncate max-w-[150px]">{image.name}</div>
                                        <Badge variant="secondary" className="mt-1">{image.category || 'Lain-lain'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleCopyUrl(image.url)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Salin URL
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(image)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
             ) : (
                <div className="text-center text-muted-foreground py-8">
                    Belum ada media yang diunggah.
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini hanya akan menghapus riwayat dari database, bukan file asli dari Cloudinary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
