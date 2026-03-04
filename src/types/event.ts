export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Event {
  id: string;
  title: string;
  date: string; // ISO 8601
  imageUrl?: string;
  imageAlt?: string;
  imageSource?: 'unsplash' | 'pexels' | 'gallery';
  imageAuthor?: string;
  imageAuthorUrl?: string;
  imageObjectFit?: 'contain' | 'cover' | 'center' | 'blur';
  location?: string;
  countdownFormat?: CountdownFormat;
  font?: string; // fontFamily string
  tags: Tag[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type CountdownFormat = 'days' | 'detailed' | 'hours' | 'weeks' | 'full';

export interface CountdownValue {
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: {
    days: number;
    hours: number;
    weeks: number;
  };
}
