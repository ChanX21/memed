import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const useCountdown = (endTime: bigint): TimeLeft => {
  const calculateTimeLeft = (): TimeLeft => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const total = Number(endTime - now);
    
    if (total <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(total / (60 * 60 * 24)),
      hours: Math.floor((total % (60 * 60 * 24)) / (60 * 60)),
      minutes: Math.floor((total % (60 * 60)) / 60),
      seconds: total % 60,
      total
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
}; 