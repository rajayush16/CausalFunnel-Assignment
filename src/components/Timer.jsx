import React from 'react';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Timer({ remainingTime }) {
  return (
    <div className="timer">
      <span>Time Left</span>
      <strong>{formatTime(remainingTime)}</strong>
    </div>
  );
}
