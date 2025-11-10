import { useState, useEffect, useCallback } from 'react';
import type { UserDto as User } from '../../../shared/utils/apiService'; // Use UserDto from apiService
import apiService from '../../../shared/utils/apiService';

export function useUsersData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get<User[]>('/v1/Users');
      setUsers(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const availableSites = [
    'القناطر - القاهرة 01',
    'القناطر - القاهرة 02',
    'محطة رفع - القاهرة 02',
    'القناطر - الإسكندرية 01',
    'محطة رفع - الجيزة 01',
    'محطة رفع - الدقهلية 02',
  ];

  const toggleUserActive = async (userId: string) => {
    try {
      // Optimistically update UI
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
      );
      // Call API to update status
      // Assuming there's an endpoint like PUT /v1/Users/{id}/toggle-active or PATCH /v1/Users/{id}
      await apiService.patch(`/v1/Users/${userId}`, { isActive: !users.find(u => u.id === userId)?.isActive });
    } catch (err: any) {
      // If API call fails, revert UI (or re-fetch for simplicity)
      alert(`Failed to toggle user status: ${err.message}`);
      fetchUsers(); // Re-fetch to ensure data consistency
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiService.del(`/v1/Users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  return { users, setUsers, availableSites, toggleUserActive, deleteUser, loading, error, fetchUsers };
}
