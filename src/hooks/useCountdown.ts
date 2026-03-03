import { useState, useEffect, useRef } from 'react';
import type { CountdownFormat, CountdownValue } from '~/types/event';
import { getCountdownValue, formatCountdown } from '~/utils/countdown';

interface UseCountdownResult {
  value: CountdownValue;
  formatted: string;
}

export function useCountdown(targetDate: string, format: CountdownFormat): UseCountdownResult {
  const [value, setValue] = useState<CountdownValue>(() => getCountdownValue(targetDate));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setValue(getCountdownValue(targetDate));

    intervalRef.current = setInterval(() => {
      setValue(getCountdownValue(targetDate));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetDate]);

  return {
    value,
    formatted: formatCountdown(value, format),
  };
}
