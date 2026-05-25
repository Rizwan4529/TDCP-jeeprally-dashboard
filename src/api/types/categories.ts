export type CategoryRecord = {
  _id: string;
  title: string;
  key: string;
  image?: string | null;
  description?: string | null;
  max_members: number;
  navigator_allowed: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type GetCategoriesResponse = ApiResponse<CategoryRecord[]>;
