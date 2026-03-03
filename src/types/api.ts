export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

export interface PexelsPhoto {
  id: number;
  src: {
    medium: string;
    small: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
  photographer_url: string;
}

export interface ImageSearchResult {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  authorName: string;
  authorUrl: string;
  source: 'unsplash' | 'pexels';
}
