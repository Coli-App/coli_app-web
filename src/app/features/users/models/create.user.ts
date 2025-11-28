export interface CreateUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student' | 'trainer';
}
