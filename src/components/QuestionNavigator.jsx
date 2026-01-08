import React from 'react';

export default function QuestionNavigator({
  total,
  currentIndex,
  visited,
  attempted,
  onNavigate,
  visibleIndexes,
  filterActive,
  onClearFilter,
}) {
  const indices = visibleIndexes || Array.from({ length: total }, (_, index) => index);

  return (
    <div className="question-nav">
      <h3>Questions</h3>
      {filterActive && (
        <div className="filter-row">
          <span>Showing unanswered</span>
          <button type="button" className="ghost" onClick={onClearFilter}>
            Show all
          </button>
        </div>
      )}
      <div className="question-grid">
        {indices.map((index) => {
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
