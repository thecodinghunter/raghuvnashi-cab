
'use client';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  fractionDigits?: number;
}

const AnimatedCounter = ({
  from = 0,
  to,
  duration = 1,
  fractionDigits = 0,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const currentCount = from + progress * (to - from);
      setCount(currentCount);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [to, from, duration]);

  return <span>{count.toLocaleString(undefined, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}</span>;
};

export default AnimatedCounter;
