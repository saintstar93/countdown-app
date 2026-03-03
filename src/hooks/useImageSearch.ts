import { useState, useCallback } from 'react';
import type { ImageSearchResult } from '~/types/api';
import { searchUnsplashPhotos } from '~/services/unsplash';
import { searchPexelsPhotos } from '~/services/pexels';

interface UseImageSearchResult {
  results: ImageSearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useImageSearch(): UseImageSearchResult {
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);
    setCurrentPage(1);

    const { data, error: unsplashError } = await searchUnsplashPhotos(query, 1);

    if (data && data.length > 0) {
      setResults(data);
      setIsLoading(false);
      return;
    }

    // Fallback to Pexels
    const { data: pexelsData, error: pexelsError } = await searchPexelsPhotos(query, 1);
    if (pexelsData) {
      setResults(pexelsData);
    } else {
      setError(unsplashError ?? pexelsError ?? 'Nessun risultato trovato');
      setResults([]);
    }
    setIsLoading(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (!currentQuery || isLoading) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;

    const { data } = await searchUnsplashPhotos(currentQuery, nextPage);
    if (data && data.length > 0) {
      setResults((prev) => [...prev, ...data]);
      setCurrentPage(nextPage);
    }
    setIsLoading(false);
  }, [currentQuery, currentPage, isLoading]);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setCurrentQuery('');
    setCurrentPage(1);
  }, []);

  return { results, isLoading, error, search, loadMore, reset };
}
