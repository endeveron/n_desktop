'use client';

import { useEffect, useState } from 'react';

import PrimeColumn from '@/components/shell/PrimeColumn';
import { cn } from '@/utils';

const MobileContent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'flex-center flex-1 opacity-0 trans-o',
        visible && 'opacity-100'
      )}
    >
      <PrimeColumn isMobile showExtraColumnToggle={false} />
    </div>
  );
};

export default MobileContent;
