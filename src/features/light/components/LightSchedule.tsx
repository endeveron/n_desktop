'use client';

import { useEffect, useState } from 'react';

import { WEEKDAYS } from '@/features/light/constants';
import { WeekSchedule } from '@/features/light/types';
import { cn, MINUTE } from '@/utils';

const CURRENT_TIME_UPDATE_INTERVAL = 10 * MINUTE;
const CELL_HEIGHT = 24;

interface PowerBlock {
  startHour: number;
  endHour: number;
  startOffset: number;
  endOffset: number;
}

interface WeeklyScheduleProps {
  data?: WeekSchedule | null;
}

const LightSchedule = ({ data }: WeeklyScheduleProps) => {
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // Update currentTime with interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.getHours() + now.getMinutes() / 60);
    };

    // Update immediately so we don't show null
    updateTime();

    const interval = setInterval(updateTime, CURRENT_TIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const getDayAbbreviation = (dayNameEn: string): string => {
    const abbr: Record<string, string> = {
      Monday: WEEKDAYS.MONDAY,
      Tuesday: WEEKDAYS.TUESDAY,
      Wednesday: WEEKDAYS.WEDNESDAY,
      Thursday: WEEKDAYS.THURSDAY,
      Friday: WEEKDAYS.FRIDAY,
      Saturday: WEEKDAYS.SATURDAY,
      Sunday: WEEKDAYS.SUNDAY,
    };

    return abbr[dayNameEn] || '';
  };

  const getPowerBlocks = (hours: string[]): PowerBlock[] => {
    const halfHours: number[] = [];

    hours.forEach((status, hour) => {
      if (status === 'on') {
        halfHours.push(hour * 2, hour * 2 + 1);
      } else if (status === 'off-first-half') {
        halfHours.push(hour * 2 + 1); // only second half ON
      } else if (status === 'off-second-half') {
        halfHours.push(hour * 2); // only first half ON
      }
    });

    // Merge continuous half-hours into blocks
    const blocks: PowerBlock[] = [];
    let start: number | null = null;
    let prev: number | null = null;

    for (const h of halfHours.sort((a, b) => a - b)) {
      if (start === null || prev === null) {
        // Start new block
        start = h;
        prev = h;
        continue;
      }

      if (h === prev + 1) {
        // Continue current block
        prev = h;
      } else {
        // Close previous block
        blocks.push({
          startHour: Math.floor(start / 2),
          startOffset: start % 2 ? 0.5 : 0,
          endHour: Math.floor((prev + 1) / 2),
          /**
           * endOffset:... : 0, - This ensures that when
           * a power block ends at the start of an hour
           * (like 14:00), it doesn't incorrectly extend
           * an extra hou into the visualization (to 15:00)
           */
          endOffset: (prev + 1) % 2 ? 0.5 : 0,
        });

        // Start a new block
        start = h;
        prev = h;
      }
    }

    if (start !== null && prev !== null) {
      blocks.push({
        startHour: Math.floor(start / 2),
        startOffset: start % 2 ? 0.5 : 0,
        endHour: Math.floor((prev + 1) / 2),
        endOffset: (prev + 1) % 2 ? 0.5 : 0,
      });
    }

    // Final clamp: do not allow blocks to extend past 24:00
    blocks.forEach((block) => {
      const end = block.endHour + block.endOffset;
      if (end > 24) {
        block.endHour = 24;
        block.endOffset = 0;
      }
    });

    return blocks;
  };

  if (!data || !currentTime) return null;

  const currentHour = Math.floor(currentTime);

  return (
    <div className="w-fit cursor-default">
      {/* Header Row */}
      <div className="flex mb-2">
        <div className="w-5.5 shrink-0" />
        {data.schedule.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              'w-9 h-4 flex-center text-[10px] font-bold',
              day.isToday ? 'text-accent' : 'text-muted'
            )}
          >
            {getDayAbbreviation(day.dayNameEn)}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative">
        {Array.from({ length: 24 }).map((_, hour) => (
          <div
            key={hour}
            className="flex relative"
            style={{ height: `${CELL_HEIGHT}px` }}
          >
            {/* Hour label */}
            <div className="w-5.5 flex text-[10px] text-muted font-bold pr-1 shrink-0">
              <span className="-translate-y-2">
                {hour.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Day columns */}
            {data.schedule.map((day, dayIdx) => (
              <div key={dayIdx} className="w-9 relative">
                <div
                  className={cn(
                    'absolute inset-y-0 inset-x-2 bg-muted/10'
                    // day.isToday
                    //   ? 'bg-card/90 dark:bg-card/85'
                    //   : 'bg-muted/10'
                  )}
                />

                {/* Hour line */}
                <div className="absolute top-0 inset-x-0 h-px bg-border/80 dark:bg-border/60" />

                {/* Half-hour line */}
                {hour < 24 && (
                  <div
                    className="absolute inset-x-0 h-px bg-border/40 dark:bg-border/30"
                    style={{ top: `${CELL_HEIGHT / 2}px` }}
                  />
                )}
              </div>
            ))}

            {/* Current time line */}
            {hour === currentHour && (
              <div
                className="absolute left-6 right-0 h-0.5 bg-accent-background z-10"
                style={{
                  top: `${(currentTime - currentHour) * CELL_HEIGHT}px`,
                }}
              />
            )}
          </div>
        ))}

        {/* Power blocks overlay */}
        {data.schedule.map((day, dayIdx) => {
          const blocks = getPowerBlocks(day.hours);

          return (
            <div
              key={`blocks-${dayIdx}`}
              className="absolute top-0 pointer-events-none"
              style={{
                left: `${22 + dayIdx * 36}px`,
                width: '36px',
              }}
            >
              {blocks.map((block, blockIdx) => {
                const topPos =
                  block.startHour * CELL_HEIGHT +
                  block.startOffset * CELL_HEIGHT;
                const end = Math.min(block.endHour + block.endOffset, 24);
                const bottomPos = end * CELL_HEIGHT;

                return (
                  <div
                    key={blockIdx}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      top: `${topPos}px`,
                      height: `${bottomPos - topPos}px`,
                    }}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-full rounded-full',
                        day.isToday ? 'bg-accent-background' : 'bg-muted/40'
                      )}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LightSchedule;
