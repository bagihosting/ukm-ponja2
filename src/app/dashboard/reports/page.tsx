
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getChartData, updateChartData } from '@/lib/chart-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const chartDataSchema = z.object({
  targetData: z.string().min(1, 'Data target tidak boleh kosong.'),
  personInCharge: z.string().optional(),
  programService: z.string().optional(),
  period: z.string().optional(),
});

type ChartDataFormValues = z.infer<typeof chartDataSchema>;

const initialData = `MELAKSANKAN KAMPANYE GERMAS=7
MELAKSANKAN GERAKAN MASYARAKAT=3
EDUKASI DAN PEMBINAAN PHBS TATANAN RUMAH TANGGA=13067
EDUKASI DAN PEMBINAAN PHBS TATANAN INSTITUSI PENDIDIKAN=50
EDUKASI DAN PEMBINAAN PHBS TATANAN TEMPAT UMUM=26
EDUKASI DAN PEMBINAAN PHBS TATANAN TEMPAT KERJA=10
EDUKASI DAN PEMBINAAN PHBS TATANAN FASKES=8
POSYANDU AKTIF=27
PEMBINAAN POSYANDU AKTIF=100
MONITORING POSYANDU AKTIF=27`;

export default function ReportsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChartDataFormValues>({
    resolver: zodResolver(chartDataSchema),
    defaultValues: {
      targetData: '',
      personInCharge: '',
      programService: '',
      period: '',
    },
  });

  useEffect(() => {
    async function fetchChartData() {
      setIsLoading(true);
      try {
        const data = await getChartData();
        if (data) {
          reset({
            targetData: data.targetData || initialData,
            personInCharge: data.personInCharge || '',
            programService: data.programService || '',
            period: data.period || '',
          });
        } else {
          reset({ 
            targetData: initialData,
            personInCharge: '',
            programService: '',
            period: '',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Gagal Memuat',
          description: 'Gagal memuat data grafik.',
        });
        reset({ 
            targetData: initialData,
            personInCharge: '',
            programService: '',
            period: '',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchChartData();
  }, [reset, toast]);

  const onSubmit = async (data: ChartDataFormValues) => {
    try {
      await updateChartData(data);
      toast({
        title: 'Berhasil!',
        description: 'Data laporan grafik telah berhasil diperbarui.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: `Terjadi kesalahan: ${error.message}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <h1 className="text-lg font-semibold md:text-2xl">Data Laporan Grafik</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="text-lg font-semibold md:text-2xl">Data Laporan Grafik</h1>
      <Card>
        <CardHeader>
          <CardTitle>Kelola Data Target Tahunan</CardTitle>
          <CardDescription>
            Masukkan data target untuk ditampilkan di grafik halaman utama beserta informasi pendukungnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="programService">Pelayanan Program</Label>
                    <Input id="programService" {...register('programService')} disabled={isSubmitting} placeholder="Contoh: Program UKM Esensial" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="personInCharge">Penanggung Jawab</Label>
                    <Input id="personInCharge" {...register('personInCharge')} disabled={isSubmitting} placeholder="Contoh: dr. Jane Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="period">Periode</Label>
                    <Input id="period" {...register('period')} disabled={isSubmitting} placeholder="Contoh: Jan 2024 - Des 2024" />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetData">Data Target (Format: NAMA_PROGRAM=NILAI)</Label>
              <Textarea
                id="targetData"
                {...register('targetData')}
                disabled={isSubmitting}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Setiap entri harus berada di baris baru."
              />
              {errors.targetData && <p className="text-sm text-red-500">{errors.targetData.message}</p>}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Data
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
