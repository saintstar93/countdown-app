import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUiStore } from '~/store/uiStore';
import { useEventsStore } from '~/store/eventsStore';
import { useAuthStore } from '~/store/authStore';
import { useSettingsStore } from '~/store/settingsStore';
import { useIsDark } from '~/hooks/useTheme';
import { COUNTDOWN_FORMATS } from '~/constants/countdown';
import { POLAROID_FONTS } from '~/constants/fonts';
import { getCountdownValue, formatCountdown } from '~/utils/countdown';
import { dbUploadImage } from '~/services/database';
import type { Event, CountdownFormat, Tag } from '~/types/event';

// ─── Constants ───────────────────────────────────────────────────────────────

const TITLE_MAX = 50;
const TAG_COLORS = ['#3B82F6','#EC4899','#8B5CF6','#F59E0B','#10B981','#EF4444','#06B6D4','#84CC16'];

const FIT_OPTIONS: { value: NonNullable<Event['imageObjectFit']>; label: string }[] = [
  { value: 'cover',   label: 'Riempi' },
  { value: 'contain', label: 'Adatta' },
  { value: 'center',  label: 'Centra' },
  { value: 'blur',    label: 'Sfumato' },
];

const MONTHS_IT = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre',
];

function formatDateIT(d: Date): string {
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function tomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventFormHandle {
  submit: () => Omit<Event, 'id' | 'createdAt' | 'updatedAt'> | null;
}

interface EventFormProps {
  onValidityChange: (isValid: boolean) => void;
  initialValues?: Partial<Event>;
  allowPastDate?: boolean;
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function SectionLabel({ children, muted }: { children: string; muted: string }) {
  return (
    <Text style={{
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      color: muted,
      textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {children}
    </Text>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const EventForm = forwardRef<EventFormHandle, EventFormProps>(
  ({ onValidityChange, initialValues, allowPastDate }, ref) => {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userTags = useEventsStore((s) => s.userTags);
  const addTag = useEventsStore((s) => s.addTag);

  // Form state
  const [title, setTitle] = useState(() => initialValues?.title ?? '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    initialValues?.date ? new Date(initialValues.date) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [countdownFormat, setCountdownFormat] = useState<CountdownFormat>(
    () => initialValues?.countdownFormat ?? 'days'
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    () => initialValues?.tags?.map((t) => t.id) ?? []
  );
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [selectedFontKey, setSelectedFontKey] = useState(() => {
    if (!initialValues?.font) return 'sans';
    return POLAROID_FONTS.find((f) => f.family === initialValues.font)?.key ?? 'sans';
  });
  const [imageUrl, setImageUrl] = useState<string | undefined>(() => initialValues?.imageUrl);
  const [imageAlt, setImageAlt] = useState(() => initialValues?.imageAlt ?? '');
  const [imageSource, setImageSource] = useState<Event['imageSource']>(
    () => initialValues?.imageSource
  );
  const [imageAuthor, setImageAuthor] = useState(() => initialValues?.imageAuthor ?? '');
  const [imageAuthorUrl, setImageAuthorUrl] = useState(() => initialValues?.imageAuthorUrl ?? '');
  const [imageObjectFit, setImageObjectFit] = useState<NonNullable<Event['imageObjectFit']>>(
    () => initialValues?.imageObjectFit ?? 'cover'
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Derived
  const selectedFont = POLAROID_FONTS.find(f => f.key === selectedFontKey);
  const isValid = title.trim().length > 0 && selectedDate !== null && selectedTagIds.length > 0;

  // Theme tokens
  const bg = isDark ? '#1A1A1A' : '#F5F5F0';
  const cardBg = isDark ? '#242424' : '#FFFFFF';
  const textColor = isDark ? '#F5F5F5' : '#2D2D2D';
  const mutedColor = '#9B9B9B';
  const borderColor = isDark ? '#333333' : '#EEEEEE';
  const inputBg = isDark ? '#333333' : '#F0F0F0';
  const accent = useSettingsStore((s) => s.accentColor);
  const accentText = '#FFFFFF';

  useEffect(() => { onValidityChange(isValid); }, [isValid]);

  // Pick up image selected in image-search modal
  useFocusEffect(useCallback(() => {
    const { pendingImage, setPendingImage } = useUiStore.getState();
    if (pendingImage) {
      setImageUrl(pendingImage.url);
      setImageAlt(pendingImage.alt);
      setImageSource(pendingImage.source);
      setImageAuthor(pendingImage.authorName);
      setImageAuthorUrl(pendingImage.authorUrl);
      setPendingImage(null);
    }
  }, []));

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (!isValid || !selectedDate || !user) return null;
      return {
        title: title.trim(),
        date: selectedDate.toISOString(),
        countdownFormat,
        font: selectedFont?.family,
        tags: userTags.filter(t => selectedTagIds.includes(t.id)),
        imageUrl,
        imageAlt: imageAlt || undefined,
        imageSource,
        imageAuthor: imageAuthor || undefined,
        imageAuthorUrl: imageAuthorUrl || undefined,
        imageObjectFit,
        userId: user.id,
      };
    },
  }));

  function toggleTag(id: string) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handleAddTag() {
    const name = newTagName.trim();
    if (!name || !user) return;
    setIsAddingTag(true);
    const saved = await addTag(user.id, { name, color: newTagColor });
    setIsAddingTag(false);
    if (!saved) {
      Alert.alert('Errore', 'Impossibile salvare il tag. Riprova.');
      return;
    }
    setSelectedTagIds(prev => [...prev, saved.id]);
    setNewTagName('');
    setNewTagColor(TAG_COLORS[0]);
    setShowNewTag(false);
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso negato', "Concedi l'accesso alla galleria nelle impostazioni.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const localUri = result.assets[0].uri;

    if (!user) {
      // No user yet, just show locally
      setImageUrl(localUri);
      setImageSource('gallery');
      setImageAuthor('');
      setImageAuthorUrl('');
      return;
    }

    setIsUploadingImage(true);
    const { url, error } = await dbUploadImage(user.id, localUri);
    setIsUploadingImage(false);

    if (error || !url) {
      Alert.alert('Errore upload', error ?? 'Impossibile caricare l\'immagine');
      return;
    }
    setImageUrl(url);
    setImageAlt('');
    setImageSource('gallery');
    setImageAuthor('');
    setImageAuthorUrl('');
  }

  const countdownPreview = selectedDate
    ? formatCountdown(getCountdownValue(selectedDate.toISOString()), countdownFormat)
    : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── TITOLO ── */}
      <View style={{ backgroundColor: cardBg, borderRadius: 14, padding: 16 }}>
        <SectionLabel muted={mutedColor}>Titolo *</SectionLabel>
        <TextInput
          style={{
            fontSize: 17,
            fontWeight: '500',
            color: textColor,
            backgroundColor: inputBg,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 11,
            borderWidth: 1,
            borderColor: title.trim() ? accent : borderColor,
          }}
          placeholder="Nome dell'evento…"
          placeholderTextColor={mutedColor}
          value={title}
          onChangeText={t => setTitle(t.slice(0, TITLE_MAX))}
          maxLength={TITLE_MAX}
          returnKeyType="done"
        />
        <Text style={{ fontSize: 11, color: mutedColor, textAlign: 'right', marginTop: 4 }}>
          {title.length}/{TITLE_MAX}
        </Text>
      </View>

      {/* ── DATA ── */}
      <View style={{ backgroundColor: cardBg, borderRadius: 14, padding: 16 }}>
        <SectionLabel muted={mutedColor}>Data *</SectionLabel>
        <Pressable
          onPress={() => setShowDatePicker(v => !v)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: inputBg,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: selectedDate ? accent : borderColor,
            gap: 10,
          }}
        >
          <Ionicons name="calendar-outline" size={18} color={selectedDate ? accent : mutedColor} />
          <Text style={{ flex: 1, fontSize: 16, color: selectedDate ? textColor : mutedColor }}>
            {selectedDate ? formatDateIT(selectedDate) : 'Seleziona una data…'}
          </Text>
          <Ionicons name={showDatePicker ? 'chevron-up' : 'chevron-down'} size={16} color={mutedColor} />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate ?? tomorrow()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={allowPastDate ? undefined : tomorrow()}
            locale="it-IT"
            onChange={(e, date) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (e.type === 'set' && date) {
                setSelectedDate(date);
                setShowDatePicker(false);
              }
            }}
          />
        )}
      </View>

      {/* ── FORMATO COUNTDOWN ── */}
      <View style={{ backgroundColor: cardBg, borderRadius: 14, padding: 16 }}>
        <SectionLabel muted={mutedColor}>Formato Countdown</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {COUNTDOWN_FORMATS.map(f => {
              const active = countdownFormat === f.value;
              return (
                <Pressable
                  key={f.value}
                  onPress={() => setCountdownFormat(f.value)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: active ? accent : (isDark ? '#2A2A2A' : '#F0F0F0'),
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: active ? accentText : mutedColor }}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        <View style={{
          backgroundColor: isDark ? '#111111' : '#F3F4F6',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 15, color: countdownPreview ? textColor : mutedColor, fontStyle: countdownPreview ? 'normal' : 'italic' }}>
            {countdownPreview ?? 'Seleziona una data per la preview'}
          </Text>
        </View>
      </View>

      {/* ── CATEGORIA ── */}
      <View style={{ backgroundColor: cardBg, borderRadius: 14, padding: 16 }}>
        <SectionLabel muted={mutedColor}>Categoria *</SectionLabel>

        {userTags.length === 0 ? (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={mutedColor} />
            <Text style={{ fontSize: 13, color: mutedColor, marginTop: 6 }}>
              Caricamento tag…
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {userTags.map(tag => {
              const active = selectedTagIds.includes(tag.id);
              return (
                <Pressable
                  key={tag.id}
                  onPress={() => toggleTag(tag.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: active ? tag.color : (isDark ? '#2A2A2A' : '#F3F4F6'),
                    borderWidth: active ? 0 : 1,
                    borderColor: borderColor,
                  }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: active ? '#fff' : tag.color }} />
                  <Text style={{ fontSize: 14, fontWeight: '500', color: active ? '#fff' : textColor }}>
                    {tag.name}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setShowNewTag(v => !v)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDark ? '#3A3A3A' : '#D1D5DB',
                borderStyle: 'dashed',
              }}
            >
              <Ionicons name="add" size={16} color={mutedColor} />
              <Text style={{ fontSize: 14, color: mutedColor }}>Nuovo tag</Text>
            </Pressable>
          </View>
        )}

        {showNewTag && (
          <View style={{ backgroundColor: isDark ? '#111' : '#F9FAFB', borderRadius: 10, padding: 12, gap: 10, borderWidth: 1, borderColor: borderColor }}>
            <TextInput
              style={{ fontSize: 15, color: textColor, backgroundColor: inputBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: borderColor }}
              placeholder="Nome del tag…"
              placeholderTextColor={mutedColor}
              value={newTagName}
              onChangeText={setNewTagName}
              maxLength={20}
            />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {TAG_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setNewTagColor(c)}
                  style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, borderWidth: newTagColor === c ? 3 : 0, borderColor: isDark ? '#fff' : '#1a1a1a' }}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <Pressable
                onPress={() => { setShowNewTag(false); setNewTagName(''); }}
                style={{ paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8, backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }}
              >
                <Text style={{ fontSize: 14, color: mutedColor }}>Annulla</Text>
              </Pressable>
              <Pressable
                onPress={handleAddTag}
                disabled={isAddingTag || !newTagName.trim()}
                style={{ paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8, backgroundColor: accent, opacity: (newTagName.trim() && !isAddingTag) ? 1 : 0.35, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                {isAddingTag && <ActivityIndicator size="small" color="#fff" />}
                <Text style={{ fontSize: 14, fontWeight: '600', color: accentText }}>
                  {isAddingTag ? 'Salvataggio…' : 'Aggiungi'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* ── FONT ── */}
      <View style={{ backgroundColor: cardBg, borderRadius: 14, padding: 16 }}>
        <SectionLabel muted={mutedColor}>Font</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {POLAROID_FONTS.map(font => {
              const active = selectedFontKey === font.key;
              return (
                <Pressable
                  key={font.key}
                  onPress={() => setSelectedFontKey(font.key)}
                  style={{
                    width: 100,
                    paddingVertical: 14,
                    paddingHorizontal: 8,
                    borderRadius: 12,
                    backgroundColor: active ? accent : (isDark ? '#2A2A2A' : '#F0F0F0'),
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text numberOfLines={1} style={{ fontSize: 14, fontFamily: font.family, color: active ? accentText : textColor, fontWeight: '600' }}>
                    {title.trim() || 'Evento'}
                  </Text>
                  <Text style={{ fontSize: 11, color: active ? (isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)') : mutedColor }}>
                    {font.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── IMMAGINE ── */}
      <View style={{ backgroundColor: cardBg, borderRadius: 14, padding: 16 }}>
        <SectionLabel muted={mutedColor}>Immagine</SectionLabel>
        {imageUrl ? (
          <View style={{ gap: 10 }}>
            <View style={{ borderRadius: 10, overflow: 'hidden', height: 180 }}>
              <Image source={{ uri: imageUrl }} style={{ flex: 1 }} resizeMode="cover" />
            </View>
            <Pressable
              onPress={() => router.push({ pathname: '/image-search', params: { query: title } })}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }}
            >
              <Ionicons name="refresh-outline" size={16} color={mutedColor} />
              <Text style={{ fontSize: 14, color: mutedColor }}>Cambia immagine</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => router.push({ pathname: '/image-search', params: { query: title } })}
              style={{ borderRadius: 12, borderWidth: 1.5, borderColor: borderColor, borderStyle: 'dashed', paddingVertical: 32, alignItems: 'center', gap: 8 }}
            >
              <Ionicons name="camera-outline" size={32} color={mutedColor} />
              <Text style={{ fontSize: 15, fontWeight: '500', color: textColor }}>Cerca immagine</Text>
              <Text style={{ fontSize: 13, color: mutedColor }}>Unsplash · Pexels</Text>
            </Pressable>
            <Pressable
              onPress={pickFromGallery}
              disabled={isUploadingImage}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6', opacity: isUploadingImage ? 0.6 : 1 }}
            >
              {isUploadingImage
                ? <ActivityIndicator size="small" color={mutedColor} />
                : <Ionicons name="image-outline" size={16} color={mutedColor} />
              }
              <Text style={{ fontSize: 14, color: mutedColor }}>
                {isUploadingImage ? 'Caricamento…' : 'Carica dalla galleria'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── REGOLA IMMAGINE ── */}
      {imageUrl && (
        <View style={{ backgroundColor: cardBg, borderRadius: 14, padding: 16 }}>
          <SectionLabel muted={mutedColor}>Regola Immagine</SectionLabel>

          {/* Real-time preview */}
          <View style={{ height: 180, borderRadius: 10, overflow: 'hidden', backgroundColor: isDark ? '#111' : '#E5E7EB', marginBottom: 12 }}>
            {imageObjectFit === 'blur' ? (
              <>
                <Image source={{ uri: imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" blurRadius={12} />
                <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              </>
            ) : (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={imageObjectFit === 'center' ? 'cover' : imageObjectFit}
              />
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FIT_OPTIONS.map(opt => {
              const active = imageObjectFit === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setImageObjectFit(opt.value)}
                  style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: active ? '#E8754A' : (isDark ? '#2A2A2A' : '#F3F4F6') }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', backgroundColor: isDark ? '#111' : '#E5E7EB' }}>
                    {opt.value === 'blur' ? (
                      <>
                        <Image source={{ uri: imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" blurRadius={8} />
                        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                      </>
                    ) : (
                      <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode={opt.value === 'center' ? 'cover' : opt.value} />
                    )}
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '500', color: active ? '#fff' : mutedColor }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

    </ScrollView>
  );
},
);

EventForm.displayName = 'EventForm';
export default EventForm;
