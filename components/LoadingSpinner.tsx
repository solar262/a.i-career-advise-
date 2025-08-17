import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "AI is analyzing your request...",
    "Consulting market trends...",
    "Analyzing future skill requirements...",
    "Calculating potential impact...",
    "Generating predictive insights...",
];

const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <div className="flex justify-center items-center p-8">
      <div className="flex flex-col items-center space-y-3">
        <svg className="animate-spin h-8 w-8 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-brand-text-secondary text-lg transition-opacity duration-500">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;