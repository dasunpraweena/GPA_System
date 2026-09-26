import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../services/apiClient.js';

export const useUsersViewModel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected user detail dialog
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadUsers = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true);
      setError('');
      const data = await usersApi.getAllUsers(searchTerm);
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(search);
  }, [search, loadUsers]);

  const openUserDetails = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setLoadingDetails(true);
    try {
      const data = await usersApi.getUserDetails(user.dbId);
      setDetailsData(data);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeUserDetails = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setDetailsData(null);
  };

  return {
    users,
    search,
    setSearch,
    loading,
    error,
    selectedUser,
    detailsData,
    loadingDetails,
    isModalOpen,
    openUserDetails,
    closeUserDetails,
    reload: () => loadUsers(search)
  };
};
