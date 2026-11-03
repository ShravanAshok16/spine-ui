import { apiClient } from './client';
import type { Quote } from './types';

export async function getRandomQuote(): Promise<Quote | null> {
  const { data, status } = await apiClient.get<Quote>('/api/Quotes/random');
  if (status === 204) return null;
  return data;
}