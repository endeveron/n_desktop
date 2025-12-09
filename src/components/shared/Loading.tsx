'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/utils';

type LoadingProps = {
  className?: string;
  delay?: number;
};

const Loading = ({ className, delay = 1000 }: LoadingProps) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      className={cn(
        'size-full flex-center trans-o',
        showLoading ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div className="loading"></div>
    </div>
  );
};

export default Loading;
