export interface UserBook {
  id: string;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  status: 'Unread' | 'Reading' | 'Finished' | 'DNF';
  currentPage: number;
  totalPages: number | null;
  language: string | null;
  genres: string | null;
  personalRating: number | null;
  privateNotes: string | null;
  lentTo: string | null;
  addedAt: string;
  readingSessionCount?: number;
}

export interface Quote {
  text: string;
  pageNumber: number;
  bookTitle: string;
  author: string;
}