import { useState, useEffect, useCallback } from 'react';
import { curriculumApi } from '../services/apiClient.js';

export const useCurriculumViewModel = () => {
  const [activeSemester, setActiveSemester] = useState(0);
  const [semesters, setSemesters] = useState(Array.from({ length: 8 }, () => []));
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  // Modal editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editCredits, setEditCredits] = useState(2);
  const [editIsGpa, setEditIsGpa] = useState(true);
  const [editReason, setEditReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadCurriculum = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await curriculumApi.getCurriculum();
      if (data && data.semesters) {
        setSemesters(data.semesters);
      }
    } catch (err) {
      setError(err.message || 'Failed to load curriculum.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setEditCredits(subject.credits);
    setEditIsGpa(Boolean(subject.gpa));
    setEditReason('');
    setIsModalOpen(true);
    setFeedback('');
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const saveSubjectSettings = async (e) => {
    if (e) e.preventDefault();
    if (!editingSubject) return;

    setIsSaving(true);
    setError('');
    try {
      const res = await curriculumApi.updateSubject(editingSubject.id, {
        credits: Number(editCredits),
        isGpa: Boolean(editIsGpa),
        reason: editReason
      });

      setFeedback(res.message || 'Subject settings updated successfully.');
      closeEditModal();
      await loadCurriculum();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update subject settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activeSemester,
    setActiveSemester,
    semesters,
    currentCourses: semesters[activeSemester] || [],
    loading,
    feedback,
    error,
    isModalOpen,
    editingSubject,
    editCredits,
    setEditCredits,
    editIsGpa,
    setEditIsGpa,
    editReason,
    setEditReason,
    isSaving,
    openEditModal,
    closeEditModal,
    saveSubjectSettings
  };
};
