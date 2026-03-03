import { MAX_EVENTS, MAX_MEMORIES } from '~/constants/config';
import type { Event } from '~/types/event';

export function validateEventTitle(title: string): string | null {
  if (!title.trim()) return 'Il titolo è obbligatorio';
  if (title.trim().length < 2) return 'Il titolo deve avere almeno 2 caratteri';
  if (title.trim().length > 80) return 'Il titolo non può superare 80 caratteri';
  return null;
}

export function validateEventDate(date: string): string | null {
  if (!date) return 'La data è obbligatoria';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Data non valida';
  if (d <= new Date()) return 'La data deve essere futura';
  return null;
}

export function canAddEvent(activeEvents: Event[]): boolean {
  return activeEvents.length < MAX_EVENTS;
}

export function canAddMemory(memories: Event[]): boolean {
  return memories.length < MAX_MEMORIES;
}

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'L\'email è obbligatoria';
  if (!emailRegex.test(email)) return 'Email non valida';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'La password è obbligatoria';
  if (password.length < 8) return 'La password deve avere almeno 8 caratteri';
  return null;
}
