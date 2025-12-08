'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const Time = () => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client
    (() => {
      setNow(new Date());
    })();

    const interval = setInterval(() => {
      setNow(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!now) {
    // SSR output (empty, stable → no mismatch)
    return null;
  }

  const date = format(now, 'dd.MM.yyyy');
  const hoursMinutes = format(now, 'HH:mm');

  return (
    <div className="anim-fade text-xl font-black tracking-wide cursor-default">
      <span className="mr-3 tracking-wider">{hoursMinutes}</span>
      <span className="text-muted/70 uppercase">{date}</span>
    </div>
  );
};

export default Time;
