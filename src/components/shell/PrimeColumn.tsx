'use client';

import { Columns2Icon } from '@/components/icons/Columns2Icon';
import { Columns3Icon } from '@/components/icons/Columns3Icon';
import { Card } from '@/components/shared/Card';
import { ContentBox } from '@/components/shared/ContentBox';
import MainMenu from '@/components/shared/MainMenu';
import Navbar from '@/components/shared/Navbar';
import Time from '@/components/shared/Time';
import AirQuality from '@/features/air-quality/components/AirQuality';
import Light from '@/features/light/components/Light';
import { useStore } from '@/store';
import { HIDE_SIDEBAR_TITLE, SHOW_SIDEBAR_TITLE } from '@/translations/en';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface PrimeColumnProps {
  isMobile: boolean;
  showExtraColumnToggle: boolean;
}

const PrimeColumn = ({ isMobile, showExtraColumnToggle }: PrimeColumnProps) => {
  const pathname = usePathname();

  const isExtraColumn = useStore((state) => state.isExtraColumn);
  const toggleExtraColumn = useStore((state) => state.toggleExtraColumn);

  const isRoot = useMemo(() => {
    return pathname === '/';
  }, [pathname]);

  return (
    <div className="flex flex-col w-74 shrink-0 gap-2">
      <Card size="xs" className="flex items-center pr-3 pl-2">
        <MainMenu />

        {isMobile && (
          <div className="flex-center w-full pr-2">
            <Time />
          </div>
        )}

        {isRoot ? <div className="flex-1" /> : <Navbar isMobile={isMobile} />}

        {showExtraColumnToggle ? (
          <span
            className="icon--action"
            onClick={toggleExtraColumn}
            title={isExtraColumn ? HIDE_SIDEBAR_TITLE : SHOW_SIDEBAR_TITLE}
          >
            {isExtraColumn ? <Columns2Icon /> : <Columns3Icon />}
          </span>
        ) : (
          <span className="w-6"></span>
        )}
      </Card>
      <ContentBox className="flex flex-col">
        <AirQuality />
        <Light />
      </ContentBox>
    </div>
  );
};

export default PrimeColumn;
