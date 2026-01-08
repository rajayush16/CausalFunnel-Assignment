import React from 'react';

export default function QuestionCard({ question, options, selected, onSelect }) {
  return (
    <div className="question-card">
      <h2>{question}</h2>
      <div className="options">
        {options.map((option) => (
          <label key={option} className={`option ${selected === option ? 'selected' : ''}`}>
            <input
              type="radio"
              name="answer"
              value={option}
              checked={selected === option}
              onChange={() => onSelect(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
