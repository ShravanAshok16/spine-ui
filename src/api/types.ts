export type OwnershipStatus = 'Owned' | 'Wishlist' | 'LentOut' | 'Sold' | 'Donated' | 'Lost';

export interface UserBook {
  id: string;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  status: 'Unread' | 'Reading' | 'Paused' | 'Finished' | 'DNF';
  ownership: OwnershipStatus;
  isFavourite: boolean;
  currentPage: number;
  totalPages: number | null;
  language: string | null;
  genres: string | null;
  personalRating: number | null;
  privateNotes: string | null;
  lentTo: string | null;
  addedAt: string;
  seriesId: string | null;
  seriesName: string | null;
}

export interface Quote {
  text: string;
  pageNumber: number;
  bookTitle: string;
  author: string;
}

export interface BookSearchResult {
  isbn: string | null;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  pageCount: number | null;
  genres: string | null;
  language: string | null;
  seriesName: string | null;   
  seriesPosition: number | null; 
}