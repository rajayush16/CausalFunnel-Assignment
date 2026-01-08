import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY, useQuiz } from '../context/QuizContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StartPage() {
  const navigate = useNavigate();
  const { state, dispatch, clearStorage } = useQuiz();
  const [email, setEmail] = useState(state.email || '');
  const [error, setError] = useState('');

  const hasSavedQuiz = useMemo(() => {
    return Boolean(state.email && localStorage.getItem(STORAGE_KEY));
  }, [state.email]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!emailPattern.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    if (hasSavedQuiz && trimmed !== state.email) {
      clearStorage();
      dispatch({ type: 'RESET' });
    }
    dispatch({ type: 'SET_EMAIL', payload: trimmed });
    navigate('/quiz');
  };

  const handleContinue = () => {
    navigate('/quiz');
  };

  const handleStartOver = () => {
    clearStorage();
    dispatch({ type: 'RESET' });
    setEmail('');
    setError('');
  };

  return (
    <div className="page start-page">
      <div className="card">
        <h1>Simple Quiz Application</h1>
        <p className="subtitle">Enter your email to begin the quiz.</p>
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
          {error && <p className="error-text">{error}</p>}
          <button className="primary" type="submit">Start Quiz</button>
        </form>
        {hasSavedQuiz && (
          <div className="resume-panel">
            <p>We found a saved quiz for {state.email}.</p>
            <div className="actions">
              <button className="ghost" type="button" onClick={handleContinue}>
                Continue Quiz
              </button>
              <button className="danger" type="button" onClick={handleStartOver}>
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
