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