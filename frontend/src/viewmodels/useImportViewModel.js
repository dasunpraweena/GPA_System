import { useState, useCallback } from 'react';
import { importsApi } from '../services/apiClient.js';

export const useImportViewModel = () => {
  const [step, setStep] = useState('upload'); // 'upload' | 'review' | 'complete'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Review state
  const [reviewData, setReviewData] = useState(null);
  const [reviewRows, setReviewRows] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Complete / History state
  const [appliedCount, setAppliedCount] = useState(0);
  const [appliedHistory, setAppliedHistory] = useState([]);
  const [fullHistory, setFullHistory] = useState([]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError('');
  };

  const uploadAndParse = async () => {
    if (!selectedFile) {
      setError('Please select an exam-branch result PDF file first.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const data = await importsApi.uploadPdf(formData);
      if (data) {
        setReviewData(data);
        setReviewRows(data.reviewRows || []);
        setStep('review');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and parse PDF.');
    } finally {
      setUploading(false);
    }
  };

  const toggleRowSelection = (index) => {
    setReviewRows((prev) =>
      prev.map((row, i) =>
        i === index && ['Ready', 'Conflict'].includes(row.status)
          ? { ...row, selected: !row.selected }
          : row
      )
    );
  };

  const openConfirmModal = () => {
    const selected = reviewRows.filter((r) => r.selected);
    if (selected.length === 0) {
      setError('No rows selected to apply.');
      return;
    }
    setError('');
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const applyResults = async () => {
    const selected = reviewRows.filter((r) => r.selected);
    if (selected.length === 0) return;

    setIsApplying(true);
    setError('');
    try {
      const payload = {
        fileId: reviewData?.fileId,
        subjectCode: reviewData?.subjectCode,
        subjectId: reviewData?.subjectId,
        examDetails: reviewData?.examDetails,
        selectedRows: selected
      };

      const res = await importsApi.applyResults(payload);
      setAppliedCount(res.appliedCount || selected.length);
      setAppliedHistory(res.appliedHistory || []);
      closeConfirmModal();
      setStep('complete');
    } catch (err) {
      setError(err.message || 'Failed to apply results.');
    } finally {
      setIsApplying(false);
    }
  };

  const loadHistory = useCallback(async () => {
    try {
      const data = await importsApi.getHistory();
      setFullHistory(data || []);
    } catch (err) {
      console.error('Failed to load import history:', err);
    }
  }, []);

  const resetImport = () => {
    setStep('upload');
    setSelectedFile(null);
    setReviewData(null);
    setReviewRows([]);
    setError('');
  };

  return {
    step,
    setStep,
    selectedFile,
    handleFileSelect,
    uploading,
    uploadAndParse,
    error,
    setError,
    reviewData,
    reviewRows,
    toggleRowSelection,
    isConfirmModalOpen,
    openConfirmModal,
    closeConfirmModal,
    isApplying,
    applyResults,
    appliedCount,
    appliedHistory,
    fullHistory,
    loadHistory,
    resetImport
  };
};
