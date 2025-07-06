// User types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  description?: string;
  profile_picture_base64?: string;
  profile_picture_content_type?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  description?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  full_name?: string;
  description?: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Media types
export interface MediaItem {
  id: number;
  filename: string;
  mime_type: string;
  media_type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  url?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  description?: string;
  tags?: string[];
  thumbnail_s3_key?: string;
  created_at?: string;
  updated_at?: string;
  genre?: string;
}

export interface MediaDetailResponse extends MediaItem {
  file_size?: number;
  duration?: number;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

export interface UploadMediaRequest {
  file: File;
  description?: string;
  tags?: string;
  genre?: string;
}

export interface UpdateMediaRequest {
  filename?: string;
  description?: string;
  tags?: string[];
  genre?: string;
}

export interface MediaListResponse {
  media: MediaItem[];
}

// Common types
export interface ApiError {
  detail: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  q?: string;
}