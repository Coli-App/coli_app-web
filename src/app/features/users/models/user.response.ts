export interface UserResponse {
  id: string;
  name: string;
  email: string;
  rol: 'admin' | 'user' | 'moderator';
  createdAt?: string;
  updatedAt?: string;
}