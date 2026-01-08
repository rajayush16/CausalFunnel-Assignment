import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import QuestionCard from '../components/QuestionCard';
import QuestionNavigator from '../components/QuestionNavigator';
import Timer from '../components/Timer';
import { useQuiz } from '../context/QuizContext';
import { decodeHtmlEntities } from '../utils/decodeHtmlEntities';
import { shuffleArray } from '../utils/shuffleArray';

const QUESTION_COUNT = 15;

export default function QuizPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const [showConfirm, setShowConfirm] = useState(false);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!state.email) {
      navigate('/', { replace: true });
    }
  }, [state.email, navigate]);

  useEffect(() => {
    if (state.status === 'submitted') {
      navigate('/report', { replace: true });
    }
  }, [state.status, navigate]);

  useEffect(() => {
    if (state.questions.length === 0 && state.status !== 'loading' && state.email) {
      const fetchQuestions = async () => {
        dispatch({ type: 'SET_STATUS', payload: 'loading' });
        try {
          const response = await fetch(
            `https://opentdb.com/api.php?amount=${QUESTION_COUNT}&timestamp=${Date.now()}`,
            { cache: 'no-store' }
          );
          if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
          }
          const data = await response.json();
          if (data.response_code !== 0) {
            const code = data.response_code;
            const messageMap = {
              1: 'No results found for the quiz request.',
              2: 'Invalid parameters sent to the quiz API.',
              3: 'Session token not found by the quiz API.',
              4: 'Session token has no remaining questions.',
            };
            throw new Error(messageMap[code] || 'Unable to load quiz questions.');
          }
          const questions = data.results.map((item, index) => {
            const decodedQuestion = decodeHtmlEntities(item.question);
            const decodedCorrect = decodeHtmlEntities(item.correct_answer);
            const decodedIncorrect = item.incorrect_answers.map((answer) => decodeHtmlEntities(answer));
            const options = shuffleArray([decodedCorrect, ...decodedIncorrect]);
            return {
              id: `${index}-${decodedQuestion}`,
              question: decodedQuestion,
              correctAnswer: decodedCorrect,
              options,
            };
          });
          dispatch({ type: 'SET_QUESTIONS', payload: questions });
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load quiz.' });
          dispatch({ type: 'SET_STATUS', payload: 'error' });
        }
      };
      fetchQuestions();
    }
  }, [state.questions.length, state.status, state.email, dispatch]);

  useEffect(() => {
    if (state.questions.length) {
      dispatch({ type: 'SET_VISITED', payload: state.currentIndex });
    }
  }, [state.currentIndex, state.questions.length, dispatch]);

  useEffect(() => {
    if (state.status !== 'ready') return;
    if (state.remainingTime <= 0) {
      if (!hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        dispatch({ type: 'MARK_SUBMITTED', payload: Date.now() });
        navigate('/report', { replace: true });
      }
      return;
    }
    const timeoutId = setTimeout(() => {
      dispatch({
        type: 'SET_REMAINING_TIME',
        payload: Math.max(0, state.remainingTime - 1),
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.remainingTime, state.status, dispatch, navigate]);

  const attempted = useMemo(
    () => state.selectedAnswers.map((answer) => answer !== null),
    [state.selectedAnswers]
  );

  const attemptedCount = useMemo(
    () => state.selectedAnswers.filter((answer) => answer !== null).length,
    [state.selectedAnswers]
  );

  const progressPercent = state.questions.length
    ? Math.round((attemptedCount / state.questions.length) * 100)
    : 0;

  const currentQuestion = state.questions[state.currentIndex];

  const handleSelect = (value) => {
    dispatch({
      type: 'SET_SELECTED_ANSWER',
      payload: { index: state.currentIndex, value },
    });
  };

  const handleNavigate = (index) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
  };

  const handleNext = () => {
    if (state.currentIndex < state.questions.length - 1) {
      handleNavigate(state.currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (state.currentIndex > 0) {
      handleNavigate(state.currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setShowConfirm(false);
    dispatch({ type: 'MARK_SUBMITTED', payload: Date.now() });
    navigate('/report', { replace: true });
  };

  if (state.status === 'loading') {
    return (
      <div className="page quiz-page">
        <div className="quiz-layout">
          <div className="quiz-main">
            <div className="quiz-header">
              <div className="skeleton skeleton-pill" />
              <div className="skeleton skeleton-button" />
            </div>
            <div className="question-card skeleton-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-option" />
              <div className="skeleton skeleton-option" />
              <div className="skeleton skeleton-option" />
              <div className="skeleton skeleton-option" />
            </div>
            <div className="nav-controls">
              <div className="skeleton skeleton-button" />
              <div className="skeleton skeleton-pill" />
              <div className="skeleton skeleton-button" />
            </div>
          </div>
          <div className="question-nav skeleton-panel">
            <div className="skeleton skeleton-title" />
            <div className="skeleton-grid">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="skeleton skeleton-circle" />
              ))}
            </div>
            <div className="skeleton skeleton-line" />
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="page quiz-page">
        <div className="card error-card">
          <h2>Something went wrong</h2>
          <p>{state.error}</p>
          <button
            className="primary"
            onClick={() => {
              dispatch({ type: 'SET_ERROR', payload: null });
              dispatch({ type: 'SET_STATUS', payload: 'idle' });
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="page quiz-page">
      <div className="quiz-layout">
        <div className="quiz-main">
          <div className="quiz-header">
            <Timer remainingTime={state.remainingTime} />
            <div className="quiz-header-actions">
              <div className="progress">
                <div className="progress-info">
                  <span>Answered</span>
                  <strong>{attemptedCount}/{state.questions.length}</strong>
                </div>
                <div className="progress-bar">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <button className="primary" type="button" onClick={() => setShowConfirm(true)}>
              Submit Quiz
            </button>
            </div>
          </div>
          <div className="question-wrapper" key={currentQuestion.id}>
            <QuestionCard
              question={currentQuestion.question}
              options={currentQuestion.options}
              selected={state.selectedAnswers[state.currentIndex]}
              onSelect={handleSelect}
            />
          </div>
          <div className="nav-controls">
            <button className="primary" type="button" onClick={handlePrevious} disabled={state.currentIndex === 0}>
              Previous
            </button>
            <span>
              Question {state.currentIndex + 1} of {state.questions.length}
            </span>
            <button
              className="primary"
              type="button"
              onClick={handleNext}
              disabled={state.currentIndex === state.questions.length - 1}
            >
              Next
            </button>
          </div>
        </div>
        <QuestionNavigator
          total={state.questions.length}
          currentIndex={state.currentIndex}
          visited={state.visited}
          attempted={attempted}
          onNavigate={handleNavigate}
        />
      </div>
      <ConfirmModal
        open={showConfirm}
        title="Submit quiz?"
        description="You can't change answers after submission."
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
}
