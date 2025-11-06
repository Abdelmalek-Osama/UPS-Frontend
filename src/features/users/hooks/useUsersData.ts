import { useState } from 'react';
import type { User } from '../types';

export function useUsersData() {
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

  const availableSites = [
    'مستوى المياه - القاهرة 01',
    'مستوى المياه - القاهرة 02',
    'محطة الضخ - القاهرة 02',
    'مستوى المياه - الإسكندرية 01',
    'محطة الضخ - الجيزة 01',
    'محطة الضخ - الدقهلية 02',
  ];

  const toggleUserActive = (userId: number) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    ));
  };

  const deleteUser = (userId: number) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  return { users, setUsers, availableSites, toggleUserActive, deleteUser };
}
