
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy, Trash2, MoreHorizontal, Wand2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getGalleryImages, uploadGalleryImage, deleteGalleryImage, addGalleryImageRecord, type GalleryImage } from '@/lib/gallery';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { Textarea } from '@/components/ui/textarea';

export default function GalleryPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const { toast } = useToast();

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        title: 'Gagal Memuat Riwayat Gambar',
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
      await fetchImages(); 
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
  
  const resetAiModal = () => {
    setAiPrompt('');
    setGeneratedImageUrl(null);
    setIsGenerating(false);
    setIsSaving(false);
  }

  const handleGenerateImage = async () => {
    if (!aiPrompt) {
        toast({ variant: 'destructive', title: 'Error', description: 'Deskripsi gambar tidak boleh kosong.' });
        return;
    }
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    try {
        const input: GenerateImageInput = { prompt: aiPrompt };
        const result = await generateImage(input);
        if (result.imageUrl) {
            setGeneratedImageUrl(result.imageUrl);
            toast({ title: 'Berhasil!', description: 'Gambar berhasil dibuat. Klik simpan untuk menambahkannya ke galeri.' });
        } else {
            throw new Error('AI tidak mengembalikan URL gambar.');
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Gagal Membuat Gambar',
            description: `Terjadi kesalahan: ${error.message}`,
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImageUrl || !aiPrompt) {
        toast({ variant: 'destructive', title: 'Error', description: 'Tidak ada gambar untuk disimpan.' });
        return;
    }
    setIsSaving(true);
    try {
        const imageName = `${aiPrompt.substring(0, 30).replace(/\s/g, '_')}_${Date.now()}.png`;
        await addGalleryImageRecord({ name: imageName, url: generatedImageUrl });
        toast({ title: 'Berhasil!', description: 'Gambar telah disimpan ke galeri Anda.' });
        await fetchImages();
        setIsAiModalOpen(false);
        resetAiModal();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Gagal Menyimpan ke Galeri',
            description: `Terjadi kesalahan: ${error.message}`,
        });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Galeri</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Unggah Gambar Baru</CardTitle>
            <CardDescription>Unggah Gambar di fitur ini</CardDescription>
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
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Mengunggah...' : 'Unggah Gambar'}
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setIsAiModalOpen(true)}>
              <Wand2 className="mr-2 h-4 w-4" />
              Buat dengan AI
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Gambar</CardTitle>
            <CardDescription>Daftar gambar yang riwayatnya tersimpan.</CardDescription>
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
                    <p className="font-semibold">Gagal memuat riwayat gambar.</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            ) : images.length > 0 ? (
                <div className="border rounded-md max-h-[400px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Gambar</TableHead>
                                <TableHead>Nama File</TableHead>
                                <TableHead className="text-right">Tindakan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {images.map((image) => (
                                <TableRow key={image.id}>
                                    <TableCell>
                                        <img src={image.url} alt={image.name} className="h-12 w-12 object-cover rounded-md" />
                                    </TableCell>
                                    <TableCell className="font-medium truncate max-w-[150px]">{image.name}</TableCell>
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

      <Dialog open={isAiModalOpen} onOpenChange={(isOpen) => { setIsAiModalOpen(isOpen); if (!isOpen) resetAiModal(); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Buat Gambar dengan AI</DialogTitle>
            <DialogDescription>
              Tulis deskripsi, buat gambar, lalu simpan ke galeri Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Deskripsi Gambar (Prompt)</Label>
              <Textarea
                id="ai-prompt"
                placeholder='Contoh: "Sebuah danau di pegunungan saat matahari terbenam"'
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating || isSaving}
              />
            </div>
             <Button type="button" onClick={handleGenerateImage} disabled={isGenerating || !aiPrompt}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                 <Wand2 className="mr-2 h-4 w-4" />
                 Buat Gambar
                </>
              )}
            </Button>
            
            {isGenerating && (
                <div className="aspect-video w-full flex items-center justify-center bg-muted rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {generatedImageUrl && (
                <div className="space-y-2">
                    <Label>Hasil Gambar</Label>
                    <div className="aspect-video relative overflow-hidden rounded-md border">
                        <img
                          src={generatedImageUrl}
                          alt="Gambar yang dibuat AI"
                          className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isGenerating || isSaving}>Batal</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveToGallery} disabled={!generatedImageUrl || isSaving || isGenerating}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : "Simpan ke Galeri"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
