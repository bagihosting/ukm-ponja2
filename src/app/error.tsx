
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Terjadi Kesalahan</CardTitle>
          <CardDescription>
            Maaf, aplikasi mengalami masalah yang tidak terduga.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <p className="text-sm text-muted-foreground">
             Kami telah mencatat masalah ini dan akan segera menanganinya. Silakan coba lagi.
           </p>
           {/* Optionally display error message in development */}
           {process.env.NODE_ENV === 'development' && (
             <pre className="mt-2 rounded-md bg-muted p-4 text-left text-xs text-muted-foreground overflow-auto">
               <code>{error.message}</code>
             </pre>
           )}
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
