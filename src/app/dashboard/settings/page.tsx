
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type Admin = { id: string; email: string; role: string };

const initialAdmins: Admin[] = [
  { id: '1', email: 'rahmantirta99@gmail.com', role: 'Super Admin' }
];

export default function SettingsPage() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleDelete = (id: string) => {
    // For now, prevent deleting the super admin for demo purposes
    if (id === '1') {
      alert("Tidak dapat menghapus Super Admin.");
      return;
    }
    setAdmins(admins.filter(admin => admin.id !== id));
  };
  
  const handleEditClick = (admin: Admin) => {
    setEditingAdmin(admin);
  };
  
  const handleUpdateAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAdmin) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const updatedEmail = formData.get('email') as string;

    setAdmins(admins.map(admin => 
      admin.id === editingAdmin.id ? { ...admin, email: updatedEmail } : admin
    ));
    setEditingAdmin(null);
  };

  const handleInviteAdmin = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const email = formData.get('email') as string;
      if (email) {
          // In a real app, you would send an invitation link
          // For now, we just add it to the list
          setAdmins([...admins, { id: Date.now().toString(), email, role: 'Admin' }]);
          setIsInviteOpen(false);
      }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <div className="flex flex-1 flex-col gap-4 rounded-lg">
        <Card>
          <CardHeader>
            <CardTitle>Akun Admin</CardTitle>
            <CardDescription>Kelola akun administrator untuk dasbor Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Admin yang Ada</CardTitle>
                        <CardDescription>Daftar pengguna dengan akses admin.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setIsInviteOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Undang Admin
                    </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full whitespace-nowrap border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Peran</TableHead>
                          <TableHead className="text-right">Tindakan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.email}</TableCell>
                            <TableCell>{admin.role}</TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Buka menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditClick(admin)}>Edit</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600" 
                                    onClick={() => handleDelete(admin.id)}
                                    disabled={admin.role === 'Super Admin'}
                                    >
                                    Hapus
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Admin Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={(isOpen) => !isOpen && setEditingAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Perbarui informasi untuk admin ini.</DialogDescription>
          </DialogHeader>
          {editingAdmin && (
            <form onSubmit={handleUpdateAdmin}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Alamat Email</Label>
                  <Input id="edit-email" name="email" defaultValue={editingAdmin.email} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Batal</Button>
                </DialogClose>
                <Button type="submit">Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Admin Dialog */}
       <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undang Admin Baru</DialogTitle>
            <DialogDescription>Kirim undangan ke pengguna baru untuk menjadi admin.</DialogDescription>
          </DialogHeader>
            <form onSubmit={handleInviteAdmin}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Alamat Email</Label>
                  <Input id="invite-email" name="email" type="email" placeholder="nama@contoh.com" required/>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Batal</Button>
                </DialogClose>
                <Button type="submit">Kirim Undangan</Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
