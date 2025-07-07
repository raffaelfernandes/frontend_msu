import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  TokenResponse,
  MediaItem,
  MediaDetailResponse,
  UploadMediaRequest,
  UpdateMediaRequest,
  MediaListResponse,
  PaginationParams,
  SearchParams,
} from "../types";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  }

  private getFormDataHeaders(): HeadersInit {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Network error" }));
      throw new Error(error.detail || "Request failed");
    }
    return response.json();
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: "POST",
      body: formData,
    });

    return this.handleResponse<TokenResponse>(response);
  }

  async logout(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // User methods
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_ME}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    // Remove campos undefined/null para evitar problemas de validação
    const cleanData = Object.fromEntries(
      Object.entries(userData).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.USER_BY_ID(userId)}`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(cleanData),
      }
    );

    return this.handleResponse<User>(response);
  }

  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.USER_PROFILE_PICTURE}`,
      {
        method: "POST",
        headers: this.getFormDataHeaders(),
        body: formData,
      }
    );

    return this.handleResponse<User>(response);
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.USER_BY_ID(userId)}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }

  // Media methods
  async uploadMedia(mediaData: UploadMediaRequest): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("file", mediaData.file);

    if (mediaData.description) {
      formData.append("description", mediaData.description);
    }
    if (mediaData.tags) {
      formData.append("tags", mediaData.tags);
    }
    if (mediaData.genre) {
      formData.append("genre", mediaData.genre);
    }

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MEDIA_UPLOAD}`,
      {
        method: "POST",
        headers: this.getFormDataHeaders(),
        body: formData,
      }
    );

    return this.handleResponse<MediaItem>(response);
  }

  async getMediaList(params?: PaginationParams): Promise<MediaListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MEDIA}?${searchParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<MediaListResponse>(response);
  }

  async searchMedia(params: SearchParams): Promise<MediaListResponse> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append("q", params.q);
    if (params.offset) searchParams.append("offset", params.offset.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MEDIA_SEARCH}?${searchParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<MediaListResponse>(response);
  }

  async getMediaById(id: number): Promise<MediaDetailResponse> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MEDIA_BY_ID(id)}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<MediaDetailResponse>(response);
  }

  async updateMedia(
    id: number,
    mediaData: UpdateMediaRequest
  ): Promise<MediaItem> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MEDIA_BY_ID(id)}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(mediaData),
      }
    );

    return this.handleResponse<MediaItem>(response);
  }

  async deleteMedia(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MEDIA_BY_ID(id)}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Network error" }));
      throw new Error(error.detail || "Delete failed");
    }
  }

  async getMediaStreamUrl(id: number, quality: string): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MEDIA_STREAM_URL(id, quality)}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    const data = await this.handleResponse<{ url: string }>(response);
    return data.url;
  }
}

export const apiService = new ApiService();
