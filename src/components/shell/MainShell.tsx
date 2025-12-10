'use client';

import { ReactNode, useMemo } from 'react';

import ExtraColumn from '@/components/shell/ExtraColumn';
import PrimeColumn from '@/components/shell/PrimeColumn';
import { useTailwindBreakpoint } from '@/hooks/useTailwindBreakpoint';
import { useStore } from '@/store';
import MobileContent from '@/components/shell/MobileContent';

const MainShell = ({ children }: { children: ReactNode }) => {
  const { isXs, isSm, isLg } = useTailwindBreakpoint();
  const isExtraColumn = useStore((state) => state.isExtraColumn);
  const showExtraColumnToggle = useMemo(() => isLg, [isLg]);

  return (
    <div className="anim-fade size-full flex max-sm:items-center flex-col p-2">
      <div className="flex flex-1 min-h-0 gap-2">
        {/* Mobile only */}
        {isXs && <MobileContent />}

        {/* Full layout  */}
        {isSm && (
          <>
            <PrimeColumn showExtraColumnToggle={showExtraColumnToggle} />

            {/* Page content */}
            <div className="flex flex-1 min-h-0">{children}</div>

            {/* Extra column */}
            <ExtraColumn isVisible={isLg && isExtraColumn} />
          </>
        )}
      </div>
    </div>
  );
};

export default MainShell;
