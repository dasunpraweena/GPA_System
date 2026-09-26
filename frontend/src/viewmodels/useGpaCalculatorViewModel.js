import { useState, useEffect, useCallback } from 'react';
import { resultsApi } from '../services/apiClient.js';

export const GRADE_SCALE = [
  { grade: 'A+', points: 4.0 },
  { grade: 'A', points: 4.0 },
  { grade: 'A-', points: 3.7 },
  { grade: 'B+', points: 3.3 },
  { grade: 'B', points: 3.0 },
  { grade: 'B-', points: 2.7 },
  { grade: 'C+', points: 2.3 },
  { grade: 'C', points: 2.0 },
  { grade: 'C-', points: 1.7 },
  { grade: 'D+', points: 1.3 },
  { grade: 'D', points: 1.0 },
  { grade: 'F', points: 0.0 }
];

export const useGpaCalculatorViewModel = () => {
  const [activeSemester, setActiveSemester] = useState(0); // 0 to 7
  const [semesters, setSemesters] = useState(Array.from({ length: 8 }, () => []));
  const [gpaSummary, setGpaSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await resultsApi.getMyResults();
      if (data) {
        setSemesters(data.semesters || []);
        setGpaSummary(data.gpaSummary || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load results.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onGradeChange = async (subjectId, grade) => {
    try {
      setFeedback('');
      setError('');

      // Optimistically update local semester state
      setSemesters((prev) => {
        const next = prev.map((sem) =>
          sem.map((c) =>
            c.id === subjectId
              ? { ...c, studentGrade: grade, effectiveGrade: grade, source: grade ? 'student_entered' : 'none' }
              : c
          )
        );
        return next;
      });

      const updatedData = await resultsApi.updateGrade(subjectId, grade);
      if (updatedData) {
        setSemesters(updatedData.semesters || []);
        setGpaSummary(updatedData.gpaSummary || null);
        setFeedback('Grade saved and GPA updated.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save grade.');
      // Reload on failure to sync
      loadData();
    }
  };

  const onElectiveToggle = async (subjectId, isSelected) => {
    try {
      setFeedback('');
      setError('');

      // Optimistically update
      setSemesters((prev) => {
        const next = prev.map((sem) =>
          sem.map((c) =>
            c.id === subjectId ? { ...c, included: isSelected, isSelected } : c
          )
        );
        return next;
      });

      const updatedData = await resultsApi.updateElective(subjectId, isSelected);
      if (updatedData) {
        setSemesters(updatedData.semesters || []);
        setGpaSummary(updatedData.gpaSummary || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to update elective.');
      loadData();
    }
  };

  const formatGpa = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return Number(val).toFixed(2);
  };

  const activeSemesterStats = gpaSummary?.semesters?.[activeSemester] || {
    credits: 0,
    totalCredits: 0,
    gpa: null
  };

  return {
    activeSemester,
    setActiveSemester,
    semesters,
    currentCourses: semesters[activeSemester] || [],
    gpaSummary,
    activeSemesterStats,
    loading,
    feedback,
    error,
    formatGpa,
    onGradeChange,
    onElectiveToggle,
    gradeScale: GRADE_SCALE,
    reload: loadData
  };
};
