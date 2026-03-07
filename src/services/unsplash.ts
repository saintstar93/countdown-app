import type { ApiResponse, ImageSearchResult, UnsplashPhoto } from '~/types/api';

const BASE_URL = 'https://api.unsplash.com';
const ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY as string;

export async function searchUnsplashPhotos(
  query: string,
  page = 1,
  perPage = 20
): Promise<ApiResponse<ImageSearchResult[]>> {
  try {
    const url = `${BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
    });

    if (!response.ok) {
      return { data: null, error: `Errore Unsplash: ${response.status}` };
    }

    const json = await response.json() as { results: UnsplashPhoto[] };
    const data: ImageSearchResult[] = json.results.map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.thumb,
      alt: photo.alt_description ?? query,
      authorName: photo.user.name,
      authorUrl: photo.user.links.html,
      source: 'unsplash',
    }));

    return { data, error: null };
  } catch {
    return { data: null, error: 'Errore di rete' };
  }
}
