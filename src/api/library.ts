import { apiClient } from './client';
import type { UserBook } from './types';

export async function getMyLibrary(): Promise<UserBook[]> {
  const { data } = await apiClient.get<UserBook[]>('/api/UserBooks');
  return data;
}