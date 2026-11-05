export type GalleryItem = {
  id: number;
  date: string;
  title: string;
  image: string;
  /** Optional album link; the card hides "View More" when absent. */
  link?: string;
  width: number;
  height: number;
};

export interface GalleryDetail extends GalleryItem {
  width: number;
  height: number;
  imageUrl: string;
}

export type CreateGalleryRequest = Omit<GalleryItem, 'id'> & {
  description?: string;
  tags?: string[];
};

export type UpdateGalleryRequest = Partial<Omit<GalleryItem, 'id'>> & {
  description?: string;
  tags?: string[];
};

// --- API Response Type
export type GalleryListResponse = {
  items: GalleryItem[];
  // totalItems: number;
  // totalPages: number;
  // currentPage: number;
};
