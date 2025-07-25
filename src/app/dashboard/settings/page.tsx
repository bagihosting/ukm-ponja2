
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { MoreHorizontal } from 'lucide-react';

type Admin = { id: string; email: string; role: string };

// Mock data for admin accounts
const initialAdmins: Admin[] = [
  { id: '1', email: 'rahmantirta99@gmail.com', role: 'Admin' }
];

export default function SettingsPage() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const handleDelete = (id: string) => {
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

  return (
    <>
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
            <div className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle>Tambah Admin Baru</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-admin-email">Alamat Email</Label>
                    <Input id="new-admin-email" placeholder="name@example.com" />
                  </div>
                  <Button>Kirim Undangan</Button>
                </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                  <CardTitle>Admin yang Ada</CardTitle>
                </CardHeader>
                <CardContent>
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
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(admin.id)}>Hapus</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
    </>
  );
}
