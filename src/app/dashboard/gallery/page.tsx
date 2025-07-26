
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getGalleryImages, uploadGalleryImage, deleteGalleryImage, type GalleryImage } from '@/lib/gallery';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export default function GalleryPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const { toast } = useToast();

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const fetchedImages = await getGalleryImages();
      setImages(fetchedImages);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat',
        description: 'Tidak dapat memuat daftar gambar dari database.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: 'File Terlalu Besar',
          description: 'Ukuran gambar tidak boleh melebihi 10MB.',
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
        description: 'Silakan pilih file gambar terlebih dahulu.',
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadGalleryImage(selectedFile);
      
      toast({
        title: 'Berhasil!',
        description: `Gambar "${selectedFile.name}" berhasil diunggah dan riwayat disimpan.`,
      });
      
      // Refresh the list from Firestore to show the new image
      fetchImages(); 

      setSelectedFile(null);
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
        title: 'Berhasil',
        description: 'Riwayat gambar telah berhasil dihapus.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus',
        description: 'Terjadi kesalahan saat menghapus riwayat gambar: ' + err.message,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Galeri</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Unggah Gambar Baru</CardTitle>
            <CardDescription>Unggah gambar ke freeimage.host dan simpan riwayat ke Firestore.</CardDescription>
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
            <CardTitle>Riwayat Gambar dari Firestore</CardTitle>
            <CardDescription>Daftar gambar yang riwayatnya tersimpan di Firestore.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : images.length > 0 ? (
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
                            {images.map((image) => (
                                <TableRow key={image.id}>
                                    <TableCell>
                                        <img src={image.url} alt={image.name} className="h-12 w-12 object-cover rounded-md" />
                                    </TableCell>
                                    <TableCell className="font-medium truncate max-w-[200px]">{image.name}</TableCell>
                                    <TableCell>{image.createdAt ? new Date(image.createdAt.seconds * 1000).toLocaleDateString('id-ID') : 'N/A'}</TableCell>
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
                    Belum ada gambar yang diunggah.
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
              Tindakan ini tidak dapat dibatalkan. Ini hanya akan menghapus riwayat gambar dari database, bukan gambar dari server freeimage.host.
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
    </>
  );
}
