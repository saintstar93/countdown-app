import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import type { ImageSearchResult } from '~/types/api';

interface ImageSearchGridProps {
  results: ImageSearchResult[];
  isLoading: boolean;
  error: string | null;
  onSelect: (image: ImageSearchResult) => void;
  onLoadMore?: () => void;
}

export default function ImageSearchGrid({
  results,
  isLoading,
  error,
  onSelect,
  onLoadMore,
}: ImageSearchGridProps) {
  if (isLoading && results.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      numColumns={2}
      keyExtractor={(item) => `${item.source}-${item.id}`}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerClassName="p-2"
      renderItem={({ item }) => (
        <Pressable
          className="flex-1 m-1 aspect-square"
          onPress={() => onSelect(item)}
        >
          <Image
            source={{ uri: item.thumbUrl }}
            className="w-full h-full rounded-md"
            resizeMode="cover"
            accessibilityLabel={item.alt}
          />
        </Pressable>
      )}
    />
  );
}
