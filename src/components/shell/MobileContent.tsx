'use client';

import { useEffect, useState } from 'react';

import { ContentBox } from '@/components/shared/ContentBox';
import MainMenu from '@/components/shared/MainMenu';
import AirQuality from '@/features/air-quality/components/AirQuality';
import Light from '@/features/light/components/Light';
import { cn } from '@/utils';

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
        'mt-10 flex flex-col opacity-0 trans-o',
        visible && 'opacity-100'
      )}
    >
      <AirQuality />
      <Light />

      <div className="fixed z-10 top-16 left-4">
        <MainMenu />
      </div>
    </ContentBox>
  );
};

export default MobileContent;
