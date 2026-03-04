import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useImageSearch } from '~/hooks/useImageSearch';
import { useUiStore } from '~/store/uiStore';
import type { ImageSearchResult } from '~/types/api';

const THUMB_SIZE = (Dimensions.get('window').width - 3) / 2;

export default function ImageSearchScreen() {
  const router = useRouter();
  const { query: initialQuery } = useLocalSearchParams<{ query?: string }>();
  const isDark = useColorScheme() === 'dark';
  const [searchText, setSearchText] = useState(initialQuery ?? '');
  const { results, isLoading, error, search, loadMore } = useImageSearch();
  const setPendingImage = useUiStore((s) => s.setPendingImage);

  useEffect(() => {
    if (initialQuery) search(initialQuery);
  }, []);

  const handleSearch = useCallback(() => {
    const q = searchText.trim();
    if (q) search(q);
  }, [searchText, search]);

  const handleSelect = useCallback((item: ImageSearchResult) => {
    setPendingImage(item);
    router.back();
  }, [setPendingImage, router]);

  const bg = isDark ? '#0D0D0D' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? '#6B7280' : '#9CA3AF';
  const inputBg = isDark ? '#1F1F1F' : '#F3F4F6';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Cerca immagine',
          presentation: 'modal',
          headerStyle: { backgroundColor: bg },
          headerTintColor: textColor,
        }}
      />

      {/* Search bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#1F1F1F' : '#F3F4F6',
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: inputBg,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
            gap: 6,
          }}
        >
          <Ionicons name="search" size={15} color={mutedColor} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: textColor }}
            placeholder="Cerca un'immagine…"
            placeholderTextColor={mutedColor}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={mutedColor} />
            </Pressable>
          )}
        </View>

        <Pressable onPress={handleSearch} hitSlop={8} style={{ opacity: searchText.trim() ? 1 : 0.4 }}>
          <Text style={{ color: '#6366F1', fontWeight: '600', fontSize: 15 }}>Cerca</Text>
        </Pressable>
      </View>

      {/* States */}
      {isLoading && results.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={mutedColor} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="alert-circle-outline" size={40} color={mutedColor} />
          <Text style={{ color: mutedColor, textAlign: 'center', marginTop: 12, fontSize: 14 }}>{error}</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="images-outline" size={48} color={mutedColor} />
          <Text style={{ color: mutedColor, fontSize: 14, textAlign: 'center' }}>
            {searchText.trim() ? 'Nessun risultato trovato.' : 'Cerca immagini per il tuo evento.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 1.5 }}
          ItemSeparatorComponent={() => <View style={{ height: 1.5 }} />}
          ListFooterComponent={
            isLoading ? (
              <View style={{ padding: 16 }}>
                <ActivityIndicator color={mutedColor} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              style={({ pressed }) => ({
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Image
                source={{ uri: item.thumbUrl }}
                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                resizeMode="cover"
              />
            </Pressable>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}
