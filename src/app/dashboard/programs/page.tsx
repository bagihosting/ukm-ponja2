
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getPrograms, deleteProgram, type Program } from '@/lib/programs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        const fetchedPrograms = await getPrograms();
        setPrograms(fetchedPrograms);
      } catch (err: any) {
        setError('Gagal memuat program: ' + err.message);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat daftar program.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, [toast]);

  const handleDeleteClick = (program: Program) => {
    setProgramToDelete(program);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!programToDelete) return;

    try {
      await deleteProgram(programToDelete.id);
      setPrograms(programs.filter((p) => p.id !== programToDelete.id));
      toast({
        title: 'Berhasil!',
        description: 'Program telah berhasil dihapus.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus',
        description: 'Terjadi kesalahan saat menghapus program: ' + err.message,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProgramToDelete(null);
    }
  };
  
  const renderTable = (category: string) => {
    const filteredPrograms = programs.filter(p => p.category === category);
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-[100px] sm:table-cell">
              <span className="sr-only">Gambar</span>
            </TableHead>
            <TableHead>Nama Program</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>
              <span className="sr-only">Tindakan</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPrograms.length > 0 ? filteredPrograms.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="hidden sm:table-cell">
                {program.imageUrl ? (
                  <img alt={program.name} className="aspect-square rounded-md object-cover" height="64" src={program.imageUrl} width="64" />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                )}
              </TableCell>
              <TableCell className="font-medium">{program.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                {program.description}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/programs/new?id=${program.id}`)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(program)}>
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Belum ada program dalam kategori ini.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Program UKM</h1>
        <Link href="/dashboard/programs/new">
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Tambah Program</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Program</CardTitle>
          <CardDescription>Kelola program UKM yang ada di sini. Program dibagi menjadi UKM Esensial dan UKM Pengembangan.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <Tabs defaultValue="esensial">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="esensial">UKM Esensial</TabsTrigger>
                <TabsTrigger value="pengembangan">UKM Pengembangan</TabsTrigger>
              </TabsList>
              <TabsContent value="esensial" className="mt-4">
                {renderTable('UKM Esensial')}
              </TabsContent>
              <TabsContent value="pengembangan" className="mt-4">
                {renderTable('UKM Pengembangan')}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus program secara permanen dari server.
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
