export interface CreateUser {
  name: string;
  email: string;
  password: string;
  rol: 'admin' | 'user' | 'moderator';
}