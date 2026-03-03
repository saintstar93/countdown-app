import type { CountdownFormat, CountdownValue } from '~/types/event';

export function getCountdownValue(targetDate: string): CountdownValue {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: { days: 0, hours: 0, weeks: 0 } };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);

  const months = Math.floor(totalDays / 30);
  const remainingAfterMonths = totalDays - months * 30;
  const weeks = Math.floor(remainingAfterMonths / 7);
  const days = remainingAfterMonths % 7;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  return {
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
    total: { days: totalDays, hours: totalHours, weeks: totalWeeks },
  };
}

export function formatCountdown(value: CountdownValue, format: CountdownFormat): string {
  switch (format) {
    case 'days':
      return `${value.total.days} giorni`;
    case 'detailed':
      if (value.months > 0) {
        return `${value.months} ${value.months === 1 ? 'mese' : 'mesi'}, ${value.days} giorni`;
      }
      return `${value.total.days} giorni`;
    case 'hours':
      return `${value.total.hours.toLocaleString('it-IT')} ore`;
    case 'weeks':
      return `${value.total.weeks} settimane, ${value.days} giorni`;
    case 'full': {
      const parts: string[] = [];
      if (value.months > 0) parts.push(`${value.months} ${value.months === 1 ? 'mese' : 'mesi'}`);
      if (value.weeks > 0) parts.push(`${value.weeks} ${value.weeks === 1 ? 'settimana' : 'settimane'}`);
      if (value.days > 0) parts.push(`${value.days} giorni`);
      if (value.hours > 0) parts.push(`${value.hours} ore`);
      return parts.join(', ') || '0 giorni';
    }
    default:
      return `${value.total.days} giorni`;
  }
}

export function isPastEvent(date: string): boolean {
  return new Date(date).getTime() < new Date().getTime();
}
