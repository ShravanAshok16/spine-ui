import { apiClient } from './client';
import type { BookSearchResult, UserBook } from './types';

export async function getMyLibrary(): Promise<UserBook[]> {
  const { data } = await apiClient.get<UserBook[]>('/api/UserBooks');
  return data;
}

export async function searchExternalBooks(query: string): Promise<BookSearchResult[]> {
  const { data } = await apiClient.get<BookSearchResult[]>('/api/Books/search', { params: { q: query } });
  return data;
}

export async function deleteUserBook(id: string): Promise<void> {
  await apiClient.delete(`/api/UserBooks/${id}`);
}

export async function batchDeleteBooks(ids: string[]): Promise<void> {
  await apiClient.post('/api/UserBooks/batch-delete', { userBookIds: ids });
}

export async function toggleFavourite(id: string): Promise<{ isFavourite: boolean }> {
  const { data } = await apiClient.patch(`/api/UserBooks/${id}/favourite`);
  return data;
}

export async function updateProgress(id: string, currentPage: number): Promise<{ currentPage: number, status: string }> {
  const { data } = await apiClient.patch(`/api/UserBooks/${id}/progress`, { currentPage });
  return data;
}

export async function linkSeries(seriesName: string, bookIds: string[]): Promise<void> {
  await apiClient.post('/api/UserBooks/link-series', { seriesName, bookIds });
}

export async function getSessionStats(): Promise<{ date: string; pagesRead: number }[]> {
  const { data } = await apiClient.get('/api/UserBooks/sessions/stats');
  // The backend returns [{ Date: 'YYYY-MM-DD', PagesRead: 10 }]
  // We map it to a cleaner camelCase format for the frontend
  return data.map((item: any) => ({
    date: item.date || item.Date,
    pagesRead: item.pagesRead || item.PagesRead
  }));
}