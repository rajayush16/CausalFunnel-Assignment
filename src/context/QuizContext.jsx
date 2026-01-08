import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const QuizContext = createContext(null);

const STORAGE_KEY = 'quiz_state_v1';
const EMAIL_KEY = 'quiz_email_v1';
const DEFAULT_TIME = 30 * 60;

const initialState = {
  email: '',
  questions: [],
  currentIndex: 0,
  selectedAnswers: [],
  visited: [],
  remainingTime: DEFAULT_TIME,
  status: 'idle',
  error: null,
  submittedAt: null,
};

function loadState() {
  try {
    const email = localStorage.getItem(EMAIL_KEY) || '';
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...initialState, email };
    }
    const saved = JSON.parse(raw);
    return {
      ...initialState,
      ...saved,
      email: saved.email || email,
    };
  } catch (error) {
    return { ...initialState };
  }
}

function persistState(state) {
  try {
    if (state.email) {
      localStorage.setItem(EMAIL_KEY, state.email);
    }
    const payload = {
      email: state.email,
      questions: state.questions,
      currentIndex: state.currentIndex,
      selectedAnswers: state.selectedAnswers,
      visited: state.visited,
      remainingTime: state.remainingTime,
      status: state.status,
      error: state.error,
      submittedAt: state.submittedAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Storage failures are non-fatal; skip persistence.
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_QUESTIONS':
      return {
        ...state,
        questions: action.payload,
        selectedAnswers: Array(action.payload.length).fill(null),
        visited: Array(action.payload.length).fill(false),
        currentIndex: 0,
        remainingTime: DEFAULT_TIME,
        status: 'ready',
        error: null,
        submittedAt: null,
      };
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    case 'SET_VISITED': {
      const visited = [...state.visited];
      visited[action.payload] = true;
      return { ...state, visited };
    }
    case 'SET_SELECTED_ANSWER': {
      const selectedAnswers = [...state.selectedAnswers];
      selectedAnswers[action.payload.index] = action.payload.value;
      return { ...state, selectedAnswers };
    }
    case 'SET_REMAINING_TIME':
      return { ...state, remainingTime: action.payload };
    case 'MARK_SUBMITTED':
      return { ...state, status: 'submitted', submittedAt: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    if (state.email || state.questions.length) {
      persistState(state);
    }
  }, [state]);

  const api = useMemo(() => ({
    state,
    dispatch,
    clearStorage: () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EMAIL_KEY);
    },
  }), [state]);

  return <QuizContext.Provider value={api}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
}

export { DEFAULT_TIME, STORAGE_KEY, EMAIL_KEY };
