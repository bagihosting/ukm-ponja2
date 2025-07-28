
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy, Sparkles, Image as ImageIcon } from 'lucide-react';
import { uploadImageAndCreateGalleryRecord } from '@/lib/gallery';
import { generateHealthImage } from '@/ai/flows/text-to-image-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AspectRatio } from '@/components/ui/aspect-ratio';


export default function AppsPage() {
  // State for manual upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // State for AI image generation
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedCloudinaryUrl, setGeneratedCloudinaryUrl] = useState<string | null>(null);
  
  const { toast } = useToast();

  // --- Manual Upload Handlers ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadedUrl(null);
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
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadedUrl(null);
    try {
      const url = await uploadImageAndCreateGalleryRecord(selectedFile, selectedFile.name);
      setUploadedUrl(url);
      toast({
        title: 'Berhasil!',
        description: `File "${selectedFile.name}" berhasil diunggah.`,
      });
      setSelectedFile(null);
      const fileInput = document.getElementById('cloudinary-upload') as HTMLInputElement;
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

  // --- AI Generation Handlers ---
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
       toast({
        variant: 'destructive',
        title: 'Prompt Kosong',
        description: 'Silakan masukkan deskripsi gambar yang ingin dibuat.',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setGeneratedCloudinaryUrl(null);
    try {
      const result = await generateHealthImage(prompt);
      setGeneratedImageUrl(result.imageUrl);
      if(result.cloudinaryUrl) {
          setGeneratedCloudinaryUrl(result.cloudinaryUrl);
      }
      toast({
        title: 'Gambar Berhasil Dibuat!',
        description: 'Gambar telah dibuat dan disimpan di galeri.',
      });
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

  const handleCopyUrl = (url: string | null) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'Berhasil!',
        description: 'URL file telah disalin ke clipboard.',
      });
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Aplikasi & Integrasi</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI Text-to-Image Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" />
                AI Text-to-Image
            </CardTitle>
            <CardDescription>Buat gambar unik bertema kesehatan hanya dengan deskripsi teks. Gambar yang dihasilkan akan otomatis disimpan ke galeri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="ai-prompt">Deskripsi Gambar (Prompt)</Label>
                <Textarea 
                    id="ai-prompt"
                    placeholder="Contoh: seorang dokter sedang memeriksa pasien anak-anak dengan stetoskop di ruangan yang terang"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                    className="min-h-[100px]"
                />
            </div>
            <Button onClick={handleGenerateImage} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Membuat Gambar...' : 'Buat Gambar dengan AI'}
            </Button>
            {generatedImageUrl && (
                <div className="space-y-4">
                    <Label>Hasil Gambar</Label>
                    <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
                        <img src={generatedImageUrl} alt="AI generated image" className="w-full h-full object-cover" />
                    </AspectRatio>
                    <div className="flex gap-2">
                        <Button onClick={() => handleCopyUrl(generatedCloudinaryUrl || generatedImageUrl)} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Salin URL {generatedCloudinaryUrl ? 'Cloudinary' : 'Sementara'}
                        </Button>
                    </div>
                     {!generatedCloudinaryUrl && (
                        <Alert variant="destructive">
                            <AlertDescription>
                            Gambar ini hanya sementara. Gagal menyimpannya ke galeri. Coba lagi atau salin URL sementara.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Uploader */}
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Upload className="text-primary" />
                Unggah Manual
            </CardTitle>
            <CardDescription>Unggah file gambar atau video langsung. Hasilnya akan disimpan ke galeri dan URL-nya bisa disalin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="cloudinary-upload">Pilih Gambar atau Video</Label>
                <Input id="cloudinary-upload" type="file" accept="image/*,video/mp4,video/quicktime,video/webm" onChange={handleFileChange} disabled={isUploading}/>
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
                  <AlertTitle className="mb-2">Unggah Manual Berhasil!</AlertTitle>
                  <AlertDescription className="space-y-4">
                      <p>URL file Anda:</p>
                      <Input readOnly value={uploadedUrl} className="bg-muted"/>
                      <Button onClick={() => handleCopyUrl(uploadedUrl)} variant="outline" size="sm">
                          <Copy className="mr-2 h-4 w-4" />
                          Salin URL
                      </Button>
                  </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
