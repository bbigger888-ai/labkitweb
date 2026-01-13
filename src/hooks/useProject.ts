import { useState, useCallback, useEffect, useRef } from 'react';
import { Role, InterviewState, BugReport, TestCaseDoc } from '../types';

const STORAGE_KEY = 'interview-platform-state';

const createDefaultState = (): InterviewState => ({
  currentRole: null,
  candidateName: '',
  isInterviewStarted: false,
  currentTaskIndex: 0,
  timeRemaining: 0,
  completedTasks: [],
});

export function useInterview() {
  const [state, setState] = useState<InterviewState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return createDefaultState();
      }
    }
    return createDefaultState();
  });

  const [code, setCode] = useState<string>('');
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [testCases, setTestCases] = useState<TestCaseDoc[]>([]);
  const [analysisNotes, setAnalysisNotes] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const timerRef = useRef<number | null>(null);

  // Автосохранение
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Таймер
  useEffect(() => {
    if (state.isInterviewStarted && state.timeRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isInterviewStarted, state.timeRemaining]);

  // Выбор роли
  const selectRole = useCallback((role: Role) => {
    setState((prev) => ({
      ...prev,
      currentRole: role,
    }));
  }, []);

  // Установка имени кандидата
  const setCandidateName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      candidateName: name,
    }));
  }, []);

  // Начало интервью
  const startInterview = useCallback((timeLimit: number) => {
    setState((prev) => ({
      ...prev,
      isInterviewStarted: true,
      timeRemaining: timeLimit * 60, // конвертируем минуты в секунды
      currentTaskIndex: 0,
    }));
  }, []);

  // Переход к следующей задаче
  const nextTask = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentTaskIndex: prev.currentTaskIndex + 1,
    }));
  }, []);

  // Переход к предыдущей задаче
  const prevTask = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentTaskIndex: Math.max(0, prev.currentTaskIndex - 1),
    }));
  }, []);

  // Отметка задачи как выполненной
  const completeTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      completedTasks: [...prev.completedTasks, taskId],
    }));
  }, []);

  // Сброс интервью
  const resetInterview = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setState(createDefaultState());
    setCode('');
    setBugReports([]);
    setTestCases([]);
    setAnalysisNotes('');
    setRequirements('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Добавление баг-репорта
  const addBugReport = useCallback((report: Omit<BugReport, 'id' | 'reportedAt'>) => {
    const newReport: BugReport = {
      ...report,
      id: `bug-${Date.now()}`,
      reportedAt: new Date(),
    };
    setBugReports((prev) => [...prev, newReport]);
    return newReport;
  }, []);

  // Удаление баг-репорта
  const removeBugReport = useCallback((id: string) => {
    setBugReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Добавление тест-кейса
  const addTestCase = useCallback((testCase: Omit<TestCaseDoc, 'id'>) => {
    const newTestCase: TestCaseDoc = {
      ...testCase,
      id: `tc-${Date.now()}`,
    };
    setTestCases((prev) => [...prev, newTestCase]);
    return newTestCase;
  }, []);

  // Удаление тест-кейса
  const removeTestCase = useCallback((id: string) => {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  }, []);

  // Форматирование времени
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    state,
    code,
    setCode,
    bugReports,
    testCases,
    analysisNotes,
    setAnalysisNotes,
    requirements,
    setRequirements,
    selectRole,
    setCandidateName,
    startInterview,
    nextTask,
    prevTask,
    completeTask,
    resetInterview,
    addBugReport,
    removeBugReport,
    addTestCase,
    removeTestCase,
    formatTime,
  };
}

// Вспомогательная функция для генерации ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
