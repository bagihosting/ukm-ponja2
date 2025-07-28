
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Copy, Sparkles, Image as ImageIcon, FileText, Newspaper, Presentation, BarChart, Megaphone } from 'lucide-react';
import { uploadImageAndCreateGalleryRecord } from '@/lib/gallery';
import { generateHealthImage } from '@/ai/flows/text-to-image-flow';
import { generateMakalah } from '@/ai/flows/generate-makalah-flow';
import { generateArticle } from '@/ai/flows/generate-article-flow';
import { generateSlides, type Slide } from '@/ai/flows/generate-slides-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { SlidesPreview } from '@/components/portals/slides-preview';
import { updateChartData } from '@/lib/chart-data';
import { DynamicChart } from '@/components/portals/dynamic-chart';
import { generateBanner } from '@/ai/flows/generate-banner-flow';


export default function AppsPage() {
  // State for manual upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // State for AI image generation
  const [imgPrompt, setImgPrompt] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedCloudinaryUrl, setGeneratedCloudinaryUrl] = useState<string | null>(null);
  
  // State for AI Makalah Smart
  const [makalahTitle, setMakalahTitle] = useState('');
  const [makalahTopic, setMakalahTopic] = useState('');
  const [isGeneratingMakalah, setIsGeneratingMakalah] = useState(false);
  const [generatedMakalah, setGeneratedMakalah] = useState<string | null>(null);

  // State for AI Artikel Smart
  const [articleTopic, setArticleTopic] = useState('');
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [generatedArticleTitle, setGeneratedArticleTitle] = useState<string | null>(null);
  const [generatedArticleContent, setGeneratedArticleContent] = useState<string | null>(null);

  // State for AI Text to PPT
  const [slidesTopic, setSlidesTopic] = useState('');
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<Slide[] | null>(null);

  // State for Chart Data
  const [chartDataInput, setChartDataInput] = useState('');
  const [isSavingChartData, setIsSavingChartData] = useState(false);
  const [chartVersion, setChartVersion] = useState(0); // Used to force chart rerender

  // State for AI Banner
  const [bannerPrompt, setBannerPrompt] = useState('');
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [generatedBannerUrl, setGeneratedBannerUrl] = useState<string | null>(null);
  const [generatedBannerCloudinaryUrl, setGeneratedBannerCloudinaryUrl] = useState<string | null>(null);


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
    if (!imgPrompt.trim()) {
       toast({
        variant: 'destructive',
        title: 'Prompt Kosong',
        description: 'Silakan masukkan deskripsi gambar yang ingin dibuat.',
      });
      return;
    }
    setIsGeneratingImg(true);
    setGeneratedImageUrl(null);
    setGeneratedCloudinaryUrl(null);
    try {
      const result = await generateHealthImage(imgPrompt);
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
      setIsGeneratingImg(false);
    }
  };

  const handleGenerateMakalah = async () => {
    if (!makalahTitle.trim() || !makalahTopic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Tidak Lengkap',
        description: 'Judul dan topik makalah harus diisi.',
      });
      return;
    }
    setIsGeneratingMakalah(true);
    setGeneratedMakalah(null);
    try {
      const result = await generateMakalah({ title: makalahTitle, topic: makalahTopic });
      setGeneratedMakalah(result.makalahContent);
      toast({
        title: 'Makalah Berhasil Dibuat!',
        description: 'Draf makalah telah berhasil dibuat.',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Gagal Membuat Makalah',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsGeneratingMakalah(false);
    }
  };
  
    const handleGenerateArticle = async () => {
    if (!articleTopic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Tidak Lengkap',
        description: 'Topik artikel harus diisi.',
      });
      return;
    }
    setIsGeneratingArticle(true);
    setGeneratedArticleTitle(null);
    setGeneratedArticleContent(null);
    try {
      const result = await generateArticle({ topic: articleTopic });
      setGeneratedArticleTitle(result.title);
      setGeneratedArticleContent(result.content);
      toast({
        title: 'Artikel Berhasil Dibuat!',
        description: 'Draf artikel telah berhasil dibuat.',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Gagal Membuat Artikel',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsGeneratingArticle(false);
    }
  };
  
  const handleGenerateSlides = async () => {
    if (!slidesTopic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Tidak Lengkap',
        description: 'Topik presentasi harus diisi.',
      });
      return;
    }
    setIsGeneratingSlides(true);
    setGeneratedSlides(null);
    try {
      const result = await generateSlides({ topic: slidesTopic });
      setGeneratedSlides(result.slides);
      toast({
        title: 'Presentasi Berhasil Dibuat!',
        description: `Konten untuk ${result.slides.length} slide telah berhasil dibuat.`,
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Gagal Membuat Presentasi',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const handleGenerateBanner = async () => {
    if (!bannerPrompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt Kosong',
        description: 'Silakan masukkan topik banner yang ingin dibuat.',
      });
      return;
    }
    setIsGeneratingBanner(true);
    setGeneratedBannerUrl(null);
    setGeneratedBannerCloudinaryUrl(null);
    try {
      const result = await generateBanner(bannerPrompt);
      setGeneratedBannerUrl(result.imageUrl);
      if (result.cloudinaryUrl) {
        setGeneratedBannerCloudinaryUrl(result.cloudinaryUrl);
      }
      toast({
        title: 'Banner Berhasil Dibuat!',
        description: 'Banner promosi telah dibuat dan disimpan di galeri.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Banner',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    } finally {
      setIsGeneratingBanner(false);
    }
  };


  const handleSaveChartData = async () => {
    if (!chartDataInput.trim()) {
        toast({ variant: 'destructive', title: 'Data Kosong', description: 'Silakan masukkan data untuk grafik.' });
        return;
    }
    setIsSavingChartData(true);
    try {
        await updateChartData({ targetData: chartDataInput });
        toast({ title: 'Berhasil!', description: 'Data grafik telah disimpan.' });
        setChartVersion(prev => prev + 1); // Trigger chart refresh
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: `Terjadi kesalahan: ${error.message}` });
    } finally {
        setIsSavingChartData(false);
    }
  };

  const handleCopyText = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Berhasil!',
        description: 'Teks telah disalin ke clipboard.',
      });
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Aplikasi & Integrasi</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* AI Artikel Smart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="text-primary" />
              AI Artikel Smart
            </CardTitle>
            <CardDescription>Buat draf artikel yang menarik dan siap publikasi hanya dengan memberikan topik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="article-topic">Topik Artikel</Label>
              <Textarea
                id="article-topic"
                placeholder="Contoh: Cara menjaga kesehatan jantung untuk usia muda"
                value={articleTopic}
                onChange={(e) => setArticleTopic(e.target.value)}
                disabled={isGeneratingArticle}
              />
            </div>
            <Button onClick={handleGenerateArticle} disabled={isGeneratingArticle}>
              {isGeneratingArticle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isGeneratingArticle ? 'Membuat Artikel...' : 'Buat Artikel dengan AI'}
            </Button>
            {(generatedArticleTitle || generatedArticleContent) && (
              <div className="space-y-4">
                <Label>Hasil Artikel</Label>
                <div className="space-y-2">
                  <Input 
                    readOnly
                    value={generatedArticleTitle || ''}
                    placeholder="Judul Artikel"
                    className="bg-muted font-bold"
                  />
                  <Textarea 
                    readOnly
                    value={generatedArticleContent || ''}
                    placeholder="Konten Artikel"
                    className="h-48 bg-muted"
                  />
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleCopyText(generatedArticleTitle)} variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Salin Judul
                    </Button>
                     <Button onClick={() => handleCopyText(generatedArticleContent)} variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Salin Konten
                    </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Makalah Smart */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="text-primary" />
                    AI Makalah Smart
                </CardTitle>
                <CardDescription>Buat draf makalah atau artikel akademis secara otomatis berdasarkan judul dan topik.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="makalah-title">Judul Makalah</Label>
                    <Input
                        id="makalah-title"
                        placeholder="Contoh: Pentingnya Imunisasi"
                        value={makalahTitle}
                        onChange={(e) => setMakalahTitle(e.target.value)}
                        disabled={isGeneratingMakalah}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="makalah-topic">Topik / Deskripsi Singkat</Label>
                    <Input
                        id="makalah-topic"
                        placeholder="Contoh: Jelaskan manfaat imunisasi untuk anak"
                        value={makalahTopic}
                        onChange={(e) => setMakalahTopic(e.target.value)}
                        disabled={isGeneratingMakalah}
                    />
                </div>
                <Button onClick={handleGenerateMakalah} disabled={isGeneratingMakalah}>
                    {isGeneratingMakalah ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isGeneratingMakalah ? 'Membuat Makalah...' : 'Buat Makalah dengan AI'}
                </Button>
                {generatedMakalah && (
                    <div className="space-y-4">
                        <Label>Hasil Makalah</Label>
                        <Textarea 
                            readOnly
                            value={generatedMakalah}
                            className="h-64 bg-muted"
                        />
                        <Button onClick={() => handleCopyText(generatedMakalah)} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Salin Hasil
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* AI Text-to-Image Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ImageIcon className="text-primary" />
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
                    value={imgPrompt}
                    onChange={(e) => setImgPrompt(e.target.value)}
                    disabled={isGeneratingImg}
                    className="min-h-[100px]"
                />
            </div>
            <Button onClick={handleGenerateImage} disabled={isGeneratingImg}>
                {isGeneratingImg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isGeneratingImg ? 'Membuat Gambar...' : 'Buat Gambar dengan AI'}
            </Button>
            {generatedImageUrl && (
                <div className="space-y-4">
                    <Label>Hasil Gambar</Label>
                    <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
                        <img src={generatedImageUrl} alt="AI generated image" className="w-full h-full object-cover" />
                    </AspectRatio>
                    <div className="flex gap-2">
                        <Button onClick={() => handleCopyText(generatedCloudinaryUrl || generatedImageUrl)} variant="outline" size="sm">
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
      </div>
      
      {/* Second Row of Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Banner Promosi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="text-primary" />
              AI Banner Promosi Kesehatan
            </CardTitle>
            <CardDescription>Buat banner promosi 16:9 yang menarik untuk kampanye kesehatan Anda. Hasilnya akan disimpan ke galeri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="banner-prompt">Topik Banner</Label>
              <Textarea
                id="banner-prompt"
                placeholder="Contoh: Gerakan cuci tangan pakai sabun"
                value={bannerPrompt}
                onChange={(e) => setBannerPrompt(e.target.value)}
                disabled={isGeneratingBanner}
              />
            </div>
            <Button onClick={handleGenerateBanner} disabled={isGeneratingBanner}>
              {isGeneratingBanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isGeneratingBanner ? 'Membuat Banner...' : 'Buat Banner dengan AI'}
            </Button>
            {generatedBannerUrl && (
              <div className="space-y-4">
                <Label>Hasil Banner</Label>
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                  <img src={generatedBannerUrl} alt="AI generated banner" className="w-full h-full object-cover" />
                </AspectRatio>
                <div className="flex gap-2">
                  <Button onClick={() => handleCopyText(generatedBannerCloudinaryUrl || generatedBannerUrl)} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Salin URL {generatedBannerCloudinaryUrl ? 'Cloudinary' : 'Sementara'}
                  </Button>
                </div>
                {!generatedBannerCloudinaryUrl && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Banner ini hanya sementara. Gagal menyimpannya ke galeri. Coba lagi atau salin URL sementara.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Text to PPT */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Presentation className="text-primary" />
                  AI Text to PPT/PowerPoint
              </CardTitle>
              <CardDescription>
                Buat konten presentasi yang terstruktur dari sebuah topik. Hasilnya bisa disalin ke PowerPoint, Google Slides, atau Canva.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="slides-topic">Topik Presentasi</Label>
                <Textarea
                  id="slides-topic"
                  placeholder="Contoh: Dampak Pola Tidur Terhadap Kesehatan Mental Remaja"
                  value={slidesTopic}
                  onChange={(e) => setSlidesTopic(e.target.value)}
                  disabled={isGeneratingSlides}
                />
              </div>
              <Button onClick={handleGenerateSlides} disabled={isGeneratingSlides}>
                {isGeneratingSlides ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isGeneratingSlides ? 'Membuat Konten Presentasi...' : 'Buat Presentasi dengan AI'}
              </Button>
              {generatedSlides && (
                <SlidesPreview slides={generatedSlides} />
              )}
          </CardContent>
        </Card>
      </div>

      {/* Excel to Chart */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart className="text-primary" />
                Data Excel to Grafik
            </CardTitle>
            <CardDescription>
              Ubah data mentah dari Excel menjadi grafik interaktif. Salin data dari Excel (dua kolom: nama dan angka), tempel di bawah, lalu simpan.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="chart-data">Data Grafik</Label>
                    <Textarea
                        id="chart-data"
                        placeholder="Contoh:&#10;Hipertensi = 150&#10;Diabetes = 95&#10;ISPA = 320"
                        value={chartDataInput}
                        onChange={(e) => setChartDataInput(e.target.value)}
                        disabled={isSavingChartData}
                        className="h-48 font-mono text-sm"
                    />
                     <Button onClick={handleSaveChartData} disabled={isSavingChartData}>
                        {isSavingChartData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSavingChartData ? 'Menyimpan...' : 'Simpan & Perbarui Grafik'}
                    </Button>
                </div>
                 <div className="space-y-2">
                    <Label>Pratinjau Grafik</Label>
                    <div className="p-4 border rounded-lg bg-muted min-h-[250px]">
                      <DynamicChart key={chartVersion} />
                    </div>
                </div>
            </div>
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
                    <Button onClick={() => handleCopyText(uploadedUrl)} variant="outline" size="sm">
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

    