
export const speak = (text: string, onEnd?: () => void) => {
  if ('speechSynthesis' in window) {
    // Cancel previous speech to avoid overlapping in fast games
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.15; // Slightly faster but expressive
    utterance.pitch = 1.0;
    
    if (onEnd) {
      let callbackCalled = false;
      const triggerEnd = () => {
        if (!callbackCalled) {
          callbackCalled = true;
          onEnd();
        }
      };
      
      utterance.onend = triggerEnd;
      utterance.onerror = triggerEnd;
      
      // Safety backup timeout based on word count to prevent getting stuck if speechSynthesis cuts off
      const wordCount = text.split(/\s+/).length;
      const estimatedDurationMs = (wordCount / 2.0) * 1000 + 1500;
      setTimeout(triggerEnd, Math.max(3000, estimatedDurationMs));
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    if (onEnd) onEnd();
  }
};
