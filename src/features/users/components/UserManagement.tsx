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
import type { User } from '../types';

export function UserManagement() {
  const { users, availableSites, toggleUserActive } = useUsersData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };

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
                <TableHead className="text-right">المواقع المخصصة</TableHead>
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
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
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
                  <TableCell>
                    {user.role === 'Admin' ? (
                      <span className="text-sm text-gray-500">جميع المواقع</span>
                    ) : user.assignedSites.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.assignedSites.slice(0, 2).map(site => (
                          <Badge key={site} variant="outline" className="text-xs">
                            <MapPin className="ml-1 h-3 w-3" />
                            {site.split(' - ')[1]}
                          </Badge>
                        ))}
                        {user.assignedSites.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.assignedSites.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">لا يوجد</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end" dir="ltr">
                      <Switch 
                        checked={user.active}
                        onCheckedChange={() => toggleUserActive(user.id)}
                      />
                      <span className="text-sm">
                        {user.active ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
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
        onOpenChange={setIsAddDialogOpen}
        availableSites={availableSites}
      />

      <ResetPasswordDialog 
        open={isResetPasswordOpen} 
        onOpenChange={setIsResetPasswordOpen}
        user={selectedUser}
      />
    </div>
  );
}
