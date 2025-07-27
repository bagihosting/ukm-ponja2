
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getClientAuth, firebaseConfig } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const formSchema = z.object({
  email: z.string().email({ message: 'Silakan masukkan email yang valid.' }),
  password: z.string().min(1, { message: 'Kata sandi tidak boleh kosong.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!isFirebaseConfigured) {
        throw new Error("Konfigurasi Firebase tidak ditemukan. Pastikan berkas .env Anda sudah benar dan aplikasi telah di-restart.");
      }
      const auth = getClientAuth();
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // Redirect is handled by the effect hook, but we can push here as well for faster navigation
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan tak terduga. Silakan coba lagi.';
      
      // Handle custom error for missing auth
      if (error.message.includes("Konfigurasi Firebase tidak ditemukan")) {
        errorMessage = error.message;
      } else {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Email atau kata sandi salah. Silakan coba lagi.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Format email tidak valid.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Akun pengguna ini telah dinonaktifkan.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
            break;
          default:
             if (error.message.includes("Firebase")) {
              errorMessage = `Terjadi kesalahan pada Firebase. Periksa konsol untuk detail.`;
             }
             console.error("Login Error:", error);
             break;
        }
      }

      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: errorMessage,
      });
    }
  }
  
  const isLoading = form.formState.isSubmitting || authLoading;

  // Show a loader while checking auth state or if user is found, before redirect
  if (authLoading || user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary mb-4">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Sign In</CardTitle>
          <CardDescription>Masukkan kredensial Anda untuk mengakses dasbor</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nama@contoh.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata Sandi</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
               {!isFirebaseConfigured && (
                <p className="mt-4 text-center text-sm text-destructive">
                  Kesalahan Konfigurasi: Kredensial Firebase tidak ditemukan. Periksa berkas .env Anda.
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
