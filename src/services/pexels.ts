import type { ApiResponse, ImageSearchResult, PexelsPhoto } from '~/types/api';

const BASE_URL = 'https://api.pexels.com/v1';
const API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY as string;

export async function searchPexelsPhotos(
  query: string,
  page = 1,
  perPage = 20
): Promise<ApiResponse<ImageSearchResult[]>> {
  try {
    const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    const response = await fetch(url, {
      headers: { Authorization: API_KEY },
    });

    if (!response.ok) {
      return { data: null, error: `Errore Pexels: ${response.status}` };
    }

    const json = await response.json() as { photos: PexelsPhoto[] };
    const data: ImageSearchResult[] = json.photos.map((photo) => ({
      id: String(photo.id),
      url: photo.src.medium,
      thumbUrl: photo.src.tiny,
      alt: photo.alt,
      authorName: photo.photographer,
      authorUrl: photo.photographer_url,
      source: 'pexels',
    }));

    return { data, error: null };
  } catch (err) {
    return { data: null, error: 'Errore di rete' };
  }
}
