'use client';

import { useEffect, useState } from 'react';

import { ContentBox } from '@/components/shared/ContentBox';
import AirQuality from '@/features/air-quality/components/AirQuality';
import Light from '@/features/light/components/Light';
import { cn } from '@/utils';
import Facts from '@/features/facts/components/Facts';

const MobileContent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <ContentBox
      className={cn(
        'flex w-78 flex-col opacity-0 trans-o',
        visible && 'opacity-100'
      )}
    >
      <AirQuality isMobile />
      <Light />
      <Facts />
    </ContentBox>
  );
};

export default MobileContent;
