import type { CountdownFormat } from '~/types/event';

export const COUNTDOWN_FORMATS: { value: CountdownFormat; label: string }[] = [
  { value: 'days', label: 'Giorni' },
  { value: 'detailed', label: 'Dettagliato' },
  { value: 'hours', label: 'Ore' },
  { value: 'weeks', label: 'Settimane' },
  { value: 'full', label: 'Completo' },
];

export const DEFAULT_COUNTDOWN_FORMAT: CountdownFormat = 'days';
