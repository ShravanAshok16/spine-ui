import { apiClient } from './client';

export interface Review {
  id: string;
  userId: string;
  userDisplayName: string;
  rating: number;
  reviewText?: string;
  createdAt: string;
}

export interface ReviewsResponse {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export async function getBookReviews(bookId: string): Promise<ReviewsResponse> {
  const { data } = await apiClient.get(`/api/Reviews/book/${bookId}`);
  return data;
}

export async function submitReview(bookId: string, payload: { rating: number; reviewText?: string }) {
  const { data } = await apiClient.post(`/api/Reviews/book/${bookId}`, payload);
  return data;
}