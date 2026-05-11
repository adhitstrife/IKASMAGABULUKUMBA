export interface NewsAsset {
  id: string;
  url: string;
  type: 'image' | 'video' | 'file';
  is_cover?: boolean;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  assets: NewsAsset[];
}

export interface NewsResponse {
  data: NewsItem[];
}
