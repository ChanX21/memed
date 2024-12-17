import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  texts,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseTime = 2000,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isTyping) {
      if (displayText.length < texts[currentIndex].length) {
        timeout = setTimeout(() => {
          setDisplayText(texts[currentIndex].slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        setIsPaused(true);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsTyping(true);
        setCurrentIndex((current) => (current + 1) % texts.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, isPaused, currentIndex, texts, typingSpeed, deletingSpeed]);

  return (
    <div className="min-h-[60px] flex items-center justify-center text-center px-4">
      <p className="text-lg md:text-xl text-muted-foreground/90 font-medium tracking-wide">
        {displayText}
        <span 
          className="inline-block w-[3px] h-[20px] ml-1 bg-primary animate-pulse"
          style={{
            animation: "blink 1s step-end infinite",
            opacity: isTyping ? 1 : 0.7,
          }}
        />
      </p>
    </div>
  );
};

export default TypewriterText; 