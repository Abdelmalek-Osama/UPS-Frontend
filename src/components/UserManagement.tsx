import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Plus, Edit, Trash2, Key, UserCircle, Shield, MapPin } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Operator';
  active: boolean;
  assignedSites: string[];
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    { 
      id: 1, 
      username: 'أحمد محمود', 
      email: 'ahmed@irrigation.gov.eg', 
      role: 'Admin', 
      active: true,
      assignedSites: []
    },
    { 
      id: 2, 
      username: 'محمد علي', 
      email: 'mohamed@irrigation.gov.eg', 
      role: 'Operator', 
      active: true,
      assignedSites: ['مستوى المياه - القاهرة 01', 'محطة الضخ - القاهرة 02']
    },
    { 
      id: 3, 
      username: 'فاطمة حسن', 
      email: 'fatma@irrigation.gov.eg', 
      role: 'Operator', 
      active: true,
      assignedSites: ['مستوى المياه - الإسكندرية 01']
    },
    { 
      id: 4, 
      username: 'خالد سعيد', 
      email: 'khaled@irrigation.gov.eg', 
      role: 'Admin', 
      active: false,
      assignedSites: []
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignedSites, setAssignedSites] = useState<string[]>([]);

  const availableSites = [
    'مستوى المياه - القاهرة 01',
    'مستوى المياه - القاهرة 02',
    'محطة الضخ - القاهرة 02',
    'مستوى المياه - الإسكندرية 01',
    'محطة الضخ - الجيزة 01',
    'محطة الضخ - الدقهلية 02',
  ];

  const handleToggleActive = (userId: number) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    ));
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };

  const toggleSiteAssignment = (site: string) => {
    if (assignedSites.includes(site)) {
      setAssignedSites(assignedSites.filter(s => s !== site));
    } else {
      setAssignedSites([...assignedSites, site]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">إدارة المستخدمين</h2>
          <p className="text-gray-500 mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المستخدم الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input id="username" placeholder="أحمد محمود" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" placeholder="user@irrigation.gov.eg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">مسؤول (Admin)</SelectItem>
                      <SelectItem value="Operator">مشغل (Operator)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>تخصيص المواقع (للمشغلين فقط)</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {availableSites.map(site => (
                    <div key={site} className="flex items-center gap-2">
                      <Checkbox 
                        id={`site-${site}`}
                        checked={assignedSites.includes(site)}
                        onCheckedChange={() => toggleSiteAssignment(site)}
                      />
                      <label 
                        htmlFor={`site-${site}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {site}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  المسؤولون لديهم وصول لجميع المواقع تلقائياً
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="active" defaultChecked />
                <Label htmlFor="active">الحساب نشط</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                إضافة المستخدم
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={user.active}
                        onCheckedChange={() => handleToggleActive(user.id)}
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

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
            <DialogDescription>
              إعادة تعيين كلمة المرور للمستخدم: {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                سيتم إرسال كلمة المرور الجديدة إلى البريد الإلكتروني للمستخدم
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setIsResetPasswordOpen(false)}>
              إعادة تعيين
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
