import React from 'react';

export default function QuestionNavigator({
  total,
  currentIndex,
  visited,
  attempted,
  onNavigate,
}) {
  return (
    <div className="question-nav">
      <h3>Questions</h3>
      <div className="question-grid">
        {Array.from({ length: total }, (_, index) => {
          const isCurrent = index === currentIndex;
          const isVisited = visited[index];
          const isAttempted = attempted[index];
          return (
            <button
              key={`question-${index + 1}`}
              type="button"
              className={`question-pill${isCurrent ? ' current' : ''}${
                isAttempted ? ' attempted' : isVisited ? ' visited' : ''
              }`}
              onClick={() => onNavigate(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="legend">
        <span className="legend-item visited">Visited</span>
        <span className="legend-item attempted">Attempted</span>
        <span className="legend-item current">Current</span>
      </div>
    </div>
  );
}
