'use client';

import { ReactNode, useMemo } from 'react';

import ExtraColumn from '@/components/shell/ExtraColumn';
import PrimeColumn from '@/components/shell/PrimeColumn';
import { useTailwindBreakpoint } from '@/hooks/useTailwindBreakpoint';
import { useStore } from '@/store';
// import MainMenu from '@/components/shared/MainMenu';

const MainShell = ({ children }: { children: ReactNode }) => {
  const { isXs, isSm, isLg } = useTailwindBreakpoint();
  const isExtraColumn = useStore((state) => state.isExtraColumn);
  const showExtraColumnToggle = useMemo(() => isLg, [isLg]);

  return (
    <div className="anim-fade h-dvh flex max-sm:items-center flex-col p-2">
      <div className="flex flex-1 min-h-0 gap-2">
        {/* Mobile: Only Prime column */}
        {isXs && (
          <div className="flex-center flex-1">
            <PrimeColumn isMobile showExtraColumnToggle={false} />
          </div>
        )}

        {/* Tablet | Desktop: Full layout  */}
        {isSm && (
          <>
            <PrimeColumn
              isMobile={false}
              showExtraColumnToggle={showExtraColumnToggle}
            />

            {/* Page content */}
            <div className="flex flex-1 min-h-0">{children}</div>

            {/* Extra column */}
            <ExtraColumn isVisible={isLg && isExtraColumn} />
          </>
        )}
      </div>
    </div>
  );

  // return (
  //   <div className="relative anim-fade h-dvh flex max-sm:items-center flex-col p-2">
  //     <div className="fixed top-4 left-4">
  //       <MainMenu />
  //     </div>
  //     <div className="flex flex-1 min-h-0 gap-2">
  //       <ExtraColumn isVisible={true} />
  //     </div>
  //   </div>
  // );
};

export default MainShell;
