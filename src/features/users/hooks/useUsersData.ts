import { useState, useEffect, useCallback } from 'react';
import type { UserDto as User } from '../../../shared/utils/apiService'; // Use UserDto from apiService
import apiService from '../../../shared/utils/apiService';
import { useSitesData } from '../../sites/hooks/useSitesData';
import { toast } from 'react-toastify';
import { useAuth } from '../../../shared/contexts/AuthContext'; // Import useAuth

export function useUsersData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    if (!isAuthenticated) {
      setUsers([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await apiService.get<User[] | { data: User[] }>('/v1/Users', { signal });
      if (!signal?.aborted) {
        setUsers(Array.isArray(response) ? response : (response as { data: User[] }).data || []);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Fetch users aborted');
      } else {
        setError((err as Error).message);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]); // Depend on isAuthenticated

  useEffect(() => {
    const abortController = new AbortController();
    fetchUsers(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchUsers]);

  const { sites: availableSites, loading: sitesLoading, error: sitesError } = useSitesData();

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
      toast.error((err as Error).message);
      fetchUsers(); // Re-fetch to ensure data consistency
    }
  };

  // const deleteUser = async (userId: string) => {
  //   try {
  //     await apiService.del(`/v1/Users/${userId}`);
  //     setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  //   } catch (err: any) {
  //     toast.error(`Failed to delete user: ${err.message}`);
  //   }
  // };

  return { users, setUsers, availableSites, toggleUserActive, loading, error, fetchUsers, sitesLoading, sitesError };
}
