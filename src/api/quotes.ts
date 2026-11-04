import { apiClient } from './client';

export interface DailyQuote {
  text: string;
  author: string;
}

export async function getDailyQuote(): Promise<DailyQuote | null> {
  const { data } = await apiClient.get<DailyQuote>('/api/Quotes/daily');
  return data;
}