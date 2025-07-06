const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/token',
  LOGOUT: '/auth/logout',
  
  // Users
  USERS: '/users',
  USER_ME: '/users/me',
  USER_PROFILE_PICTURE: '/users/me/profile-picture',
  USER_BY_ID: (id: number) => `/users/${id}`,
  
  // Media
  MEDIA: '/media',
  MEDIA_UPLOAD: '/media/upload',
  MEDIA_SEARCH: '/media/search',
  MEDIA_BY_ID: (id: number) => `/media/${id}`,
} as const;

export { API_BASE_URL };