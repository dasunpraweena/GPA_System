import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../services/apiClient.js';

export const useUsersViewModel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Selected user detail dialog
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // User delete confirmation dialog
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    setError('');
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      const res = await usersApi.deleteUser(userToDelete.dbId);
      setFeedback(res.message || 'User successfully removed.');
      closeDeleteModal();
      await loadUsers(search);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to remove user.');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    users,
    search,
    setSearch,
    loading,
    error,
    feedback,
    selectedUser,
    detailsData,
    loadingDetails,
    isModalOpen,
    openUserDetails,
    closeUserDetails,
    userToDelete,
    isDeleteModalOpen,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteUser,
    reload: () => loadUsers(search)
  };
};
