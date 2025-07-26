
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-9xl font-extrabold text-primary">404</CardTitle>
          <CardDescription className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Halaman Tidak Ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-base leading-7 text-muted-foreground">
            Maaf, kami tidak dapat menemukan halaman yang Anda cari.
          </p>
          <Button asChild>
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Halaman Utama
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
