import React, { useEffect, useRef } from 'react';

interface ScreenReaderProps {
  message: string;
}

const ScreenReader: React.FC<ScreenReaderProps> = ({ message }) => {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      // Announce message to screen reader
      messageRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div 
      ref={messageRef} 
      className="sr-only" 
      role="status" 
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default ScreenReader;
