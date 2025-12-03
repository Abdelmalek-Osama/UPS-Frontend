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
import type { UserDto } from '../../../shared/utils/apiService'; // Use UserDto -  // Minor change to trigger re-evaluation
import { Spinner } from '../../../components/ui/spinner';
import { getUserIdFromToken } from '../../../shared/utils/jwtService';
import { refreshAccessToken } from '../../../shared/utils/apiService';
import { setAuthCookies, getRefreshToken } from '../../../shared/utils/cookieService';
import { clearAllUserData } from '../../../shared/utils/apiService'; // Import clearAllUserData
import { toast } from 'react-toastify';

interface UserManagementProps {
  refreshCurrentUser: () => void;
}

export function UserManagement({ refreshCurrentUser }: UserManagementProps) {
  const { users, availableSites, toggleUserActive, loading, error, fetchUsers } = useUsersData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const loggedInUserId = getUserIdFromToken();

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

  const handleUserRoleChange = async (userId: string) => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        const response = await refreshAccessToken(refreshToken);
        if (response.isSuccess && response.data) {
          const { accessToken, refreshToken: newRefreshToken, accessTokenExpiryDate } = response.data;
          setAuthCookies(accessToken, newRefreshToken, new Date(accessTokenExpiryDate));
          refreshCurrentUser(); // Call to refresh the current user's role in App.tsx
          toast.success('User role updated successfully!');
          // Optionally, you might want to force a re-render of components that depend on the user's role
          // For now, refreshing the token and cookies should be sufficient for immediate application
        } else {
          console.error('Failed to refresh token:', response.message);
          toast.error('Failed to refresh token. Please log in again.');
          clearAllUserData(); // Clear all data on failed token refresh
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error during token refresh:', error);
        toast.error('An error occurred during token refresh. Please log in again.');
        clearAllUserData(); // Clear all data on error during token refresh
        window.location.href = '/login';
      }
    } else {
      console.warn('No refresh token found. User will be logged out.');
      clearAllUserData(); // Clear all data if no refresh token
      window.location.reload(); // Force re-login if no refresh token
    }
    fetchUsers(); // Always refetch the user list
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
              {users.map((user) => {
                return (
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
                          disabled={user.id === loggedInUserId}
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
                );
              })}
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
        loggedInUserId={loggedInUserId}
        onUserRoleChange={handleUserRoleChange}
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
