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