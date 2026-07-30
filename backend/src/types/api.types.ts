import { TAny } from './any';
export interface ApiResponse<T = TAny> {
  success: boolean;
  message: string;
  data?: T;
  errors?: TAny;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
