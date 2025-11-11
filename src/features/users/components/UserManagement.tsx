import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { Switch } from '../../../components/ui/switch';
import { Plus, Edit, Key, UserCircle, Shield, MapPin } from 'lucide-react';
import { useUsersData } from '../hooks/useUsersData';
import { AddUserDialog } from './AddUserDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { EditUserDialog } from './EditUserDialog';
import type { UserDto } from '../../../shared/utils/apiService'; // Use UserDto
import { Spinner } from '../../../components/ui/spinner';

export function UserManagement() {
  const { users, availableSites, toggleUserActive, loading, error, fetchUsers } = useUsersData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const handleResetPassword = (user: UserDto) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };

  const handleEditUser = (user: UserDto) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Refetch users after adding a new user
  const handleAddUserSuccess = () => {
    setIsAddDialogOpen(false);
    fetchUsers();
  };

  // Refetch users after editing a user
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="text-gray-500 mr-2">جارٍ تحميل المستخدمين...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">إدارة المستخدمين</h2>
          <p className="text-gray-500 mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمون ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                {/* <TableHead className="text-right">المواقع المخصصة</TableHead> */}
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                      <Shield className="ml-1 h-3 w-3" />
                      {user.role === 'Admin' ? 'مسؤول' : 'مشغل'}
                    </Badge>
                  </TableCell>
                  {/* Removed assignedSites display as it's not in UserDto */}
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end" dir="ltr">
                      <Switch 
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserActive(user.id)}
                      />
                      <span className="text-sm">
                        {user.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleResetPassword(user)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddUserDialog 
        open={isAddDialogOpen} 
        onOpenChange={handleAddUserSuccess} // Updated to call handleAddUserSuccess
        availableSites={availableSites}
      />

      <EditUserDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onEditSuccess={handleEditSuccess}
      />

      <ResetPasswordDialog 
        open={isResetPasswordOpen} 
        onOpenChange={setIsResetPasswordOpen}
        user={selectedUser}
      />
    </div>
  );
}
