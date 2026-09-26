# ViewModels Layer (VM in MVVM)

In React, the ViewModel layer is implemented using **Custom Hooks**:
- Manages state (`useState`, `useReducer`, `useMemo`, `useCallback`).
- Exposes clean observables/state properties and action handlers (e.g. `handleSubmit`, `onFilterChange`) to the Views.
- Connects to the Service layer to fetch and persist data.
- Keeps Views completely decoupled from business logic, data transformation, and API calls.

### Example ViewModel Hook Pattern:
```javascript
// src/viewmodels/useGpaCalculatorViewModel.js
import { useState, useCallback } from 'react';
import { calculateGPA } from '../models/gpaModel';
import { gradeService } from '../services/gradeService';

export const useGpaCalculatorViewModel = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addCourse = useCallback((newCourse) => {
    setCourses((prev) => [...prev, newCourse]);
  }, []);

  const gpa = calculateGPA(courses);

  return {
    courses,
    gpa,
    isLoading,
    error,
    addCourse
  };
};
```
