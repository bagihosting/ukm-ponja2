
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || 'Admin';

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Admin Dashboard</h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg">
        <Card className="w-full max-w-2xl text-center shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight">Selamat Datang, {displayName}!</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">Senang melihat Anda kembali. Mari kita mulai.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mt-4 overflow-hidden rounded-lg">
                    <img 
                        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDBjcG05cnFtd3NocXBpZ3V0b3JmZzJzMXAzZTJqenJrbmF2bXc5NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btQ0NH6KlQOI7ew/giphy.gif"
                        alt="Welcome Animation"
                        className="w-full h-auto object-cover"
                    />
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
