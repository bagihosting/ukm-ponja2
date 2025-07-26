
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getProfileContent,
  updateProfileContent,
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  defaultProfileContent,
  type ProfileContent,
  type TeamMember
} from '@/lib/profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, PlusCircle, Edit, Save, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const profileSchema = z.object({
  about: z.string().min(1, 'Deskripsi tidak boleh kosong'),
  vision: z.string().min(1, 'Visi tidak boleh kosong'),
  mission: z.string().min(1, 'Misi tidak boleh kosong'),
});

const memberSchema = z.object({
  name: z.string().min(1, 'Nama tidak boleh kosong'),
  role: z.string().min(1, 'Peran tidak boleh kosong'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type MemberFormValues = z.infer<typeof memberSchema>;

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // State for UI modes
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      about: '',
      vision: '',
      mission: ''
    }
  });
  
  const addMemberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', role: ''},
  });

  const editMemberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, members] = await Promise.all([
        getProfileContent().catch(() => defaultProfileContent), // Fallback on error
        getTeamMembers()
      ]);
      profileForm.reset(profile);
      setTeamMembers(members);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Gagal Memuat Data', description: 'Gagal mengambil data dari server.' });
    } finally {
      setLoading(false);
    }
  }, [profileForm, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onProfileSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setSavingProfile(true);
    try {
      await updateProfileContent(data);
      toast({ title: 'Berhasil', description: 'Konten profil berhasil diperbarui.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: `Terjadi kesalahan: ${error.message}` });
    } finally {
      setSavingProfile(false);
    }
  };
  
  const handleAddNewMember: SubmitHandler<MemberFormValues> = async (data) => {
    try {
      const newMemberId = await addTeamMember(data);
      setTeamMembers(prev => [...prev, { id: newMemberId, ...data }]);
      toast({ title: 'Berhasil', description: 'Anggota baru berhasil ditambahkan.' });
      setIsAddingMember(false);
      addMemberForm.reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menambah', description: `Terjadi kesalahan: ${error.message}` });
    }
  };

  const handleUpdateMember: SubmitHandler<MemberFormValues> = async (data) => {
    if (!editingMemberId) return;
    try {
      await updateTeamMember(editingMemberId, data);
      setTeamMembers(teamMembers.map(m => (m.id === editingMemberId ? { ...m, ...data } : m)));
      toast({ title: 'Berhasil', description: 'Anggota berhasil diperbarui.' });
      setEditingMemberId(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Memperbarui', description: `Terjadi kesalahan: ${error.message}` });
    }
  };
  
  const startEditing = (member: TeamMember) => {
    setEditingMemberId(member.id);
    editMemberForm.reset({ name: member.name, role: member.role });
    setIsAddingMember(false);
  };

  const confirmDelete = async () => {
    if (!deletingMemberId) return;
    try {
      await deleteTeamMember(deletingMemberId);
      setTeamMembers(teamMembers.filter(m => m.id !== deletingMemberId));
      toast({ title: 'Berhasil', description: 'Anggota berhasil dihapus.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menghapus', description: `Terjadi kesalahan: ${error.message}` });
    } finally {
      setDeletingMemberId(null);
    }
  };

  if (loading) {
    return (
       <div className="space-y-8">
        <h1 className="text-lg font-semibold md:text-2xl">Kelola Halaman Profil</h1>
        <Card>
          <CardHeader>
            <CardTitle>Konten "Tentang Kami"</CardTitle>
            <CardDescription>Ubah deskripsi, visi, dan misi yang ditampilkan di halaman profil publik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Struktur Organisasi</CardTitle>
            <CardDescription>Kelola anggota tim yang ditampilkan di halaman profil.</CardDescription>
          </CardHeader>
          <CardContent>
             <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-lg font-semibold md:text-2xl">Kelola Halaman Profil</h1>
        
        {/* Profile Content Form */}
        <Card>
          <CardHeader>
            <CardTitle>Konten "Tentang Kami"</CardTitle>
            <CardDescription>Ubah deskripsi, visi, dan misi yang ditampilkan di halaman profil publik.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="about">Deskripsi Umum</Label>
                <Textarea id="about" {...profileForm.register('about')} className="mt-2 min-h-[120px]" />
                {profileForm.formState.errors.about && <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.about.message}</p>}
              </div>
              <div>
                <Label htmlFor="vision">Visi</Label>
                <Textarea id="vision" {...profileForm.register('vision')} className="mt-2" />
                 {profileForm.formState.errors.vision && <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.vision.message}</p>}
              </div>
              <div>
                <Label htmlFor="mission">Misi</Label>
                <Textarea id="mission" {...profileForm.register('mission')} className="mt-2" />
                 {profileForm.formState.errors.mission && <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.mission.message}</p>}
              </div>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Perubahan Konten
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Team Members Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Struktur Organisasi</CardTitle>
                  <CardDescription>Kelola anggota tim yang ditampilkan di halaman profil.</CardDescription>
                </div>
                {!isAddingMember && !editingMemberId && (
                  <Button size="sm" onClick={() => { setIsAddingMember(true); addMemberForm.reset(); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Anggota
                  </Button>
                )}
            </div>
          </CardHeader>
          <CardContent>
              <form onSubmit={editMemberForm.handleSubmit(handleUpdateMember)}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Peran</TableHead>
                      <TableHead className="text-right w-[100px]">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isAddingMember && (
                      <TableRow>
                        <TableCell>
                          <Input {...addMemberForm.register('name')} placeholder="Nama Anggota" autoFocus disabled={addMemberForm.formState.isSubmitting} />
                          {addMemberForm.formState.errors.name && <p className="text-sm text-red-500 mt-1">{addMemberForm.formState.errors.name.message}</p>}
                        </TableCell>
                        <TableCell>
                          <Input {...addMemberForm.register('role')} placeholder="Peran dalam tim" disabled={addMemberForm.formState.isSubmitting} />
                          {addMemberForm.formState.errors.role && <p className="text-sm text-red-500 mt-1">{addMemberForm.formState.errors.role.message}</p>}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <Button type="button" size="icon" variant="ghost" disabled={addMemberForm.formState.isSubmitting} onClick={addMemberForm.handleSubmit(handleAddNewMember)}>
                             {addMemberForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-green-600" />}
                           </Button>
                           <Button size="icon" variant="ghost" onClick={() => setIsAddingMember(false)} disabled={addMemberForm.formState.isSubmitting}><X className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )}

                    {teamMembers.map((member) => (
                      editingMemberId === member.id ? (
                         <TableRow key={member.id}>
                          <TableCell>
                              <Input {...editMemberForm.register('name')} autoFocus disabled={editMemberForm.formState.isSubmitting}/>
                              {editMemberForm.formState.errors.name && <p className="text-sm text-red-500 mt-1">{editMemberForm.formState.errors.name.message}</p>}
                          </TableCell>
                          <TableCell>
                            <Input {...editMemberForm.register('role')} disabled={editMemberForm.formState.isSubmitting}/>
                             {editMemberForm.formState.errors.role && <p className="text-sm text-red-500 mt-1">{editMemberForm.formState.errors.role.message}</p>}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button type="submit" size="icon" variant="ghost" disabled={editMemberForm.formState.isSubmitting}>
                              {editMemberForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-green-600" />}
                            </Button>
                            <Button type="button" size="icon" variant="ghost" onClick={() => setEditingMemberId(null)} disabled={editMemberForm.formState.isSubmitting}><X className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={member.id}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="icon" variant="ghost" onClick={() => startEditing(member)} disabled={isAddingMember || !!editingMemberId}><Edit className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeletingMemberId(member.id)} disabled={isAddingMember || !!editingMemberId}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          </TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </form>
              {teamMembers.length === 0 && !isAddingMember && (
                <p className="text-center text-muted-foreground py-4">Belum ada anggota tim.</p>
              )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deletingMemberId} onOpenChange={(open) => !open && setDeletingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus anggota tim ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
