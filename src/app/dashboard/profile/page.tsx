
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getProfileContent,
  updateProfileContent,
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
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

// Separate form for editing, to avoid state conflicts
const editMemberSchema = memberSchema;
type EditMemberFormValues = z.infer<typeof editMemberSchema>;

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isEditingMember, setIsEditingMember] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });
  
  const addMemberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', role: ''},
  });

  const editMemberForm = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
  });


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profile, members] = await Promise.all([getProfileContent(), getTeamMembers()]);
        if (profile) {
          profileForm.reset(profile);
        }
        setTeamMembers(members);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Gagal Memuat Data', description: 'Gagal mengambil data profil dari server.' });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profileForm, toast]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setSavingProfile(true);
    try {
      await updateProfileContent(data);
      toast({ title: 'Berhasil', description: 'Konten profil berhasil diperbarui.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: error.message });
    } finally {
      setSavingProfile(false);
    }
  };
  
  const handleAddNewMember = async (data: MemberFormValues) => {
    try {
      const newMemberId = await addTeamMember(data);
      setTeamMembers([...teamMembers, { id: newMemberId, ...data }]);
      toast({ title: 'Berhasil', description: 'Anggota baru berhasil ditambahkan.' });
      setIsAddingMember(false);
      addMemberForm.reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menambah', description: error.message });
    }
  };

  const handleUpdateMember = async (memberId: string, data: EditMemberFormValues) => {
    try {
      await updateTeamMember(memberId, data);
      setTeamMembers(teamMembers.map(m => (m.id === memberId ? { ...m, ...data } : m)));
      toast({ title: 'Berhasil', description: 'Anggota berhasil diperbarui.' });
      setIsEditingMember(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Memperbarui', description: error.message });
    }
  };
  
  const startEditing = (member: TeamMember) => {
    setIsEditingMember(member.id);
    editMemberForm.reset({ name: member.name, role: member.role });
    setIsAddingMember(false);
  };

  const cancelEditing = () => {
    setIsEditingMember(null);
    editMemberForm.reset();
  };

  const handleDeleteMember = async () => {
    if (!deletingMemberId) return;
    try {
      await deleteTeamMember(deletingMemberId);
      setTeamMembers(teamMembers.filter(m => m.id !== deletingMemberId));
      toast({ title: 'Berhasil', description: 'Anggota berhasil dihapus.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal Menghapus', description: error.message });
    } finally {
      setDeletingMemberId(null);
    }
  };

  if (loading) {
    return (
       <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
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
              {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              {!isAddingMember && (
                <Button size="sm" onClick={() => { setIsAddingMember(true); setIsEditingMember(null); addMemberForm.reset(); }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Anggota
                </Button>
              )}
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingMember && (
                   <TableRow>
                    <TableCell>
                      <Input {...addMemberForm.register('name')} placeholder="Nama Anggota" />
                       {addMemberForm.formState.errors.name && <p className="text-sm text-red-500 mt-1">{addMemberForm.formState.errors.name.message}</p>}
                    </TableCell>
                    <TableCell>
                      <Input {...addMemberForm.register('role')} placeholder="Peran dalam tim" />
                       {addMemberForm.formState.errors.role && <p className="text-sm text-red-500 mt-1">{addMemberForm.formState.errors.role.message}</p>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button size="icon" variant="ghost" onClick={addMemberForm.handleSubmit(handleAddNewMember)}><Save className="h-4 w-4 text-green-600" /></Button>
                       <Button size="icon" variant="ghost" onClick={() => setIsAddingMember(false)}><X className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                )}

                {teamMembers.map((member) => (
                  isEditingMember === member.id ? (
                     <TableRow key={member.id}>
                      <TableCell>
                        <Input {...editMemberForm.register('name')} />
                        {editMemberForm.formState.errors.name && <p className="text-sm text-red-500 mt-1">{editMemberForm.formState.errors.name.message}</p>}
                      </TableCell>
                      <TableCell>
                        <Input {...editMemberForm.register('role')} />
                         {editMemberForm.formState.errors.role && <p className="text-sm text-red-500 mt-1">{editMemberForm.formState.errors.role.message}</p>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="icon" variant="ghost" onClick={editMemberForm.handleSubmit((data) => handleUpdateMember(member.id, data))}><Save className="h-4 w-4 text-green-600" /></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEditing}><X className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="icon" variant="ghost" onClick={() => startEditing(member)}><Edit className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeletingMemberId(member.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  )
                ))}
              </TableBody>
            </Table>
            {teamMembers.length === 0 && !isAddingMember && (
              <p className="text-center text-muted-foreground py-4">Belum ada anggota tim.</p>
            )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingMemberId} onOpenChange={(open) => !open && setDeletingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    