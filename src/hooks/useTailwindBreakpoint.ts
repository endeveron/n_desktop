import { useEffect, useState } from 'react';

/**
 * Tailwind CSS default breakpoints (in pixels)
 * Tailwind 4 uses the same breakpoints as v3
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

interface BreakpointState {
  current: Breakpoint | 'xs';
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  width: number;
}

/**
 * Custom hook to detect current Tailwind breakpoint
 * Returns the current breakpoint and boolean flags for each size
 *
 * @example
 * const { current, isMd, isLg } = useTailwindBreakpoint();
 *
 * if (isMd) {
 *   // Do something for medium screens and up
 * }
 */
export function useTailwindBreakpoint(): BreakpointState {
  const [breakpoint, setBreakpoint] = useState<BreakpointState>({
    current: 'xs',
    isXs: true,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    is2xl: false,
    width: 0,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after hydration
    (() => setIsClient(true))();
  }, []);

  useEffect(() => {
    // Only run on client after hydration
    if (!isClient) return;

    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    // Set initial value after hydration
    handleResize();

    // Use ResizeObserver for better performance if available
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.documentElement);

      return () => resizeObserver.disconnect();
    }

    // Fallback to window resize event
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  return breakpoint;
}

/**
 * Determines the current breakpoint based on window width
 */
function getBreakpoint(width: number): BreakpointState {
  let current: Breakpoint | 'xs' = 'xs';

  if (width >= BREAKPOINTS['2xl']) {
    current = '2xl';
  } else if (width >= BREAKPOINTS.xl) {
    current = 'xl';
  } else if (width >= BREAKPOINTS.lg) {
    current = 'lg';
  } else if (width >= BREAKPOINTS.md) {
    current = 'md';
  } else if (width >= BREAKPOINTS.sm) {
    current = 'sm';
  }

  return {
    current,
    isXs: width < BREAKPOINTS.sm,
    isSm: width >= BREAKPOINTS.sm,
    isMd: width >= BREAKPOINTS.md,
    isLg: width >= BREAKPOINTS.lg,
    isXl: width >= BREAKPOINTS.xl,
    is2xl: width >= BREAKPOINTS['2xl'],
    width,
  };
}

/**
 * Hook to check if current screen matches a specific breakpoint or above
 *
 * @example
 * const isMobile = useBreakpointValue('md', false, true);
 * // Returns true on xs/sm, false on md and above
 */
export function useBreakpointValue<T>(
  breakpoint: Breakpoint,
  aboveValue: T,
  belowValue: T
): T {
  const { width } = useTailwindBreakpoint();
  return width >= BREAKPOINTS[breakpoint] ? aboveValue : belowValue;
}
