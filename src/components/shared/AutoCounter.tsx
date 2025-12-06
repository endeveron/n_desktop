'use client';

import { useEffect, useState } from 'react';

interface AutoCounterProps {
  loading: boolean;
}

export default function AutoCounter({ loading }: AutoCounterProps) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!loading) {
      (() => setCount(1))();
      return;
    }

    const interval = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);

    return () => {
      setCount(1);
      clearInterval(interval);
    };
  }, [loading]);

  return <div className="font-bold text-accent">{count}</div>;
}
