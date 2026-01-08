import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';

export default function ReportPage() {
  const navigate = useNavigate();
  const { state, dispatch, clearStorage } = useQuiz();

  const summary = useMemo(() => {
    const attempted = state.selectedAnswers.filter((answer) => answer !== null).length;
    const correct = state.questions.reduce((count, question, index) => {
      return state.selectedAnswers[index] === question.correctAnswer ? count + 1 : count;
    }, 0);
    return { attempted, correct };
  }, [state.questions, state.selectedAnswers]);

  useEffect(() => {
    if (!state.questions.length || state.status !== 'submitted') {
      navigate('/', { replace: true });
    }
  }, [state.questions.length, state.status, navigate]);

  if (!state.questions.length || state.status !== 'submitted') {
    return null;
  }

  const handleRestart = () => {
    clearStorage();
    dispatch({ type: 'RESET' });
    navigate('/', { replace: true });
  };

  return (
    <div className="page report-page">
      <div className="card report-card">
        <h1>Quiz Report</h1>
        <div className="summary">
          <div>
            <span>Attempted</span>
            <strong>{summary.attempted} / {state.questions.length}</strong>
          </div>
          <div>
            <span>Correct</span>
            <strong>{summary.correct}</strong>
          </div>
          <div>
            <span>Score</span>
            <strong>{summary.correct} / {state.questions.length}</strong>
          </div>
        </div>
        <button className="primary" type="button" onClick={handleRestart}>
          Restart Quiz
        </button>
      </div>

      <div className="report-list">
        {state.questions.map((question, index) => {
          const selected = state.selectedAnswers[index];
          const isCorrect = selected === question.correctAnswer;
          return (
            <div key={question.id} className="report-item">
              <h3>Q{index + 1}. {question.question}</h3>
              <p className={`answer ${selected ? (isCorrect ? 'correct' : 'wrong') : ''}`}>
                <strong>Your answer:</strong> {selected || 'Not answered'}
              </p>
              <p className="answer correct">
                <strong>Correct answer:</strong> {question.correctAnswer}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
