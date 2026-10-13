export interface ApiResponseEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  skip?: number;
  limit?: number;
}
