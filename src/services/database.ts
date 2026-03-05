/**
 * database.ts — Supabase CRUD layer
 * All DB operations live here. Stores call these functions and manage local state.
 *
 * Schema column mappings (DB → App):
 *   event_date        → date
 *   countdown_format  → countdownFormat ('complete' ↔ 'full')
 *   image_source      → imageSource     ('upload' ↔ 'gallery')
 *   image_photographer→ imageAuthor
 *   image_fit         → imageObjectFit
 *   is_memory         → split into events[] / memories[] arrays
 *
 * Fields NOT in DB (memory-only): location, imageAlt, imageAuthorUrl
 */

import { supabase } from './supabase';
import type { Event, Tag } from '~/types/event';
import type { ThemeMode } from '~/store/settingsStore';
import { isPastEvent } from '~/utils/countdown';

// ── Helpers ───────────────────────────────────────────────────────────────────

type Err = { error: string | null };

/** DB 'complete' → App 'full', everything else passes through */
function mapCF(dbFormat: string): Event['countdownFormat'] {
  return (dbFormat === 'complete' ? 'full' : dbFormat) as Event['countdownFormat'];
}
function unmapCF(cf: Event['countdownFormat'] | undefined): string {
  return cf === 'full' ? 'complete' : (cf ?? 'days');
}

/** DB 'upload' → App 'gallery', null → undefined */
function mapIS(dbSource: string | null): Event['imageSource'] {
  if (dbSource === 'upload') return 'gallery';
  return (dbSource ?? undefined) as Event['imageSource'];
}
function unmapIS(is: Event['imageSource']): string | null {
  if (is === 'gallery') return 'upload';
  return is ?? null;
}

type DbEventRow = {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  countdown_format: string;
  font: string;
  image_url: string | null;
  image_source: string | null;
  image_photographer: string | null;
  image_fit: string;
  is_memory: boolean;
  created_at: string;
  updated_at: string;
  event_tags?: Array<{ tags: { id: string; name: string; color: string } | null }>;
};

function rowToEvent(row: DbEventRow): Event {
  const tags: Tag[] = (row.event_tags ?? [])
    .map((et) => et.tags)
    .filter((t): t is Tag => t !== null);
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    date: row.event_date,
    countdownFormat: mapCF(row.countdown_format),
    font: row.font === 'default' ? undefined : row.font,
    imageUrl: row.image_url ?? undefined,
    imageSource: mapIS(row.image_source),
    imageAuthor: row.image_photographer ?? undefined,
    imageObjectFit: (row.image_fit as Event['imageObjectFit']) ?? 'cover',
    tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function dbFetchEvents(
  userId: string,
): Promise<{ data: Event[] | null } & Err> {
  const { data, error } = await supabase
    .from('events')
    .select('*, event_tags(tags(id, name, color))')
    .eq('user_id', userId)
    .order('event_date', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: (data as DbEventRow[]).map(rowToEvent), error: null };
}

export async function dbCreateEvent(
  eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ data: Event | null } & Err> {
  const { data: row, error } = await supabase
    .from('events')
    .insert({
      user_id: eventData.userId,
      title: eventData.title,
      event_date: eventData.date,
      countdown_format: unmapCF(eventData.countdownFormat),
      font: eventData.font ?? 'default',
      image_url: eventData.imageUrl ?? null,
      image_source: unmapIS(eventData.imageSource),
      image_photographer: eventData.imageAuthor ?? null,
      image_fit: eventData.imageObjectFit ?? 'cover',
      is_memory: isPastEvent(eventData.date),
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  if (eventData.tags.length > 0) {
    const { error: tagErr } = await supabase
      .from('event_tags')
      .insert(eventData.tags.map((t) => ({ event_id: row.id, tag_id: t.id })));
    if (tagErr) {
      await supabase.from('events').delete().eq('id', row.id);
      return { data: null, error: tagErr.message };
    }
  }

  return {
    data: rowToEvent({
      ...row,
      event_tags: eventData.tags.map((t) => ({ tags: t })),
    } as DbEventRow),
    error: null,
  };
}

export async function dbUpdateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'createdAt' | 'userId'>>,
): Promise<{ data: Event | null } & Err> {
  const patch: Record<string, unknown> = {};
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.date !== undefined) {
    patch.event_date = updates.date;
    patch.is_memory = isPastEvent(updates.date);
  }
  if (updates.countdownFormat !== undefined) patch.countdown_format = unmapCF(updates.countdownFormat);
  if (updates.font !== undefined) patch.font = updates.font ?? 'default';
  if (updates.imageUrl !== undefined) patch.image_url = updates.imageUrl ?? null;
  if (updates.imageSource !== undefined) patch.image_source = unmapIS(updates.imageSource);
  if (updates.imageAuthor !== undefined) patch.image_photographer = updates.imageAuthor ?? null;
  if (updates.imageObjectFit !== undefined) patch.image_fit = updates.imageObjectFit ?? 'cover';

  const { error } = await supabase.from('events').update(patch).eq('id', id);
  if (error) return { data: null, error: error.message };

  if (updates.tags !== undefined) {
    await supabase.from('event_tags').delete().eq('event_id', id);
    if (updates.tags.length > 0) {
      const { error: tagErr } = await supabase
        .from('event_tags')
        .insert(updates.tags.map((t) => ({ event_id: id, tag_id: t.id })));
      if (tagErr) return { data: null, error: tagErr.message };
    }
  }

  // Re-fetch complete row with tags
  const { data: full, error: fetchErr } = await supabase
    .from('events')
    .select('*, event_tags(tags(id, name, color))')
    .eq('id', id)
    .single();
  if (fetchErr) return { data: null, error: fetchErr.message };
  return { data: rowToEvent(full as DbEventRow), error: null };
}

export async function dbDeleteEvent(id: string): Promise<Err> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function dbPromoteToMemory(id: string): Promise<Err> {
  const { error } = await supabase
    .from('events')
    .update({ is_memory: true })
    .eq('id', id);
  return { error: error?.message ?? null };
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export async function dbFetchTags(
  userId: string,
): Promise<{ data: Tag[] | null } & Err> {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, color')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: data as Tag[], error: null };
}

export async function dbCreateTag(
  userId: string,
  tag: Omit<Tag, 'id'>,
): Promise<{ data: Tag | null } & Err> {
  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name: tag.name, color: tag.color })
    .select('id, name, color')
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Tag, error: null };
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function dbFetchProfile(userId: string): Promise<{
  displayName: string | null;
  themePreference: ThemeMode | null;
} & Err> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, theme_preference')
    .eq('id', userId)
    .single();
  if (error) return { displayName: null, themePreference: null, error: error.message };
  return {
    displayName: data.display_name as string | null,
    themePreference: data.theme_preference as ThemeMode | null,
    error: null,
  };
}

export async function dbUpdateTheme(userId: string, mode: ThemeMode): Promise<Err> {
  const { error } = await supabase
    .from('profiles')
    .update({ theme_preference: mode })
    .eq('id', userId);
  return { error: error?.message ?? null };
}

// ── Suggestions ───────────────────────────────────────────────────────────────

export async function dbCreateSuggestion(userId: string, content: string): Promise<Err> {
  const { error } = await supabase
    .from('suggestions')
    .insert({ user_id: userId, content });
  return { error: error?.message ?? null };
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function dbUploadImage(
  userId: string,
  uri: string,
): Promise<{ url: string | null } & Err> {
  try {
    const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    const contentType = safeExt === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `${userId}/${Date.now()}.${safeExt}`;

    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from('event-images')
      .upload(fileName, arrayBuffer, { contentType, upsert: true });
    if (error) return { url: null, error: error.message };

    const { data } = supabase.storage.from('event-images').getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  } catch {
    return { url: null, error: 'Errore caricamento immagine' };
  }
}
