export interface AuthResponse {
  success: boolean;
  code: number;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    };
  };
  message: string;
}
