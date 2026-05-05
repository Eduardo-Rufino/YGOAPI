'use client';

const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer ? 'http://ygoapi' : 'http://localhost:8080';

const TOKEN_KEY = 'ygo_auth_token';
const USERNAME_KEY = 'ygo_auth_username';
const USER_ID_KEY = 'ygo_auth_user_id';

/**
 * Decodes the JWT payload and extracts the 'sub' (NameIdentifier) claim,
 * which contains the numeric user ID. No extra API call needed.
 * Standard approach per RFC 7519.
 */
function decodeJwtUserId(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    // JWT uses Base64URL, which might lack padding and use different characters
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    
    const decoded = JSON.parse(atob(padded));
    console.log('JWT Decoded Payload:', decoded);
    
    // Check 'nameid' first as seen in user's token, then fallbacks
    return decoded['nameid']
      ?? decoded['sub']
      ?? decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      ?? decoded['unique_name']
      ?? null;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export const authService = {
  /**
   * Authenticates the user and stores the JWT token.
   * Endpoint: POST /Autenticator/Login
   */
  login: async (userName: string, password: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/Autenticator/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserName: userName, Password: password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Try to extract a meaningful message from the API response
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || 'Usuário ou senha inválidos.');
      } catch {
        throw new Error('Usuário ou senha inválidos.');
      }
    }

    const data = await response.json();
    const token: string = data.Token || data.token;

    if (!token) throw new Error('Token não recebido do servidor.');

    authService.setToken(token, userName);
    return token;
  },

  /**
   * Registers a new user.
   * Endpoint: POST /Autenticator/Register
   */
  register: async (name: string, userName: string, password: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Autenticator/Register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: name, UserName: userName, Password: password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || 'Erro ao criar conta. Verifique os dados.');
      } catch {
        throw new Error('Erro ao criar conta. O nome de usuário pode já estar em uso.');
      }
    }
  },

  /**
   * Stores the JWT token and username in localStorage.
   */
  setToken: (token: string, userName: string): void => {
    if (isServer) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, userName);
    const userId = decodeJwtUserId(token);
    if (userId) localStorage.setItem(USER_ID_KEY, userId);
    window.dispatchEvent(new Event('auth-change'));
  },

  /**
   * Retrieves the JWT token from localStorage.
   */
  getToken: (): string | null => {
    if (isServer) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Retrieves the logged-in username from localStorage.
   */
  getUsername: (): string | null => {
    if (isServer) return null;
    return localStorage.getItem(USERNAME_KEY);
  },

  /**
   * Retrieves the logged-in user's numeric ID from localStorage.
   * Decoded from the JWT 'sub' claim on login (RFC 7519).
   */
  getUserId: (): number | null => {
    if (isServer) return null;
    const id = localStorage.getItem(USER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  },

  /**
   * Returns true if a token exists in localStorage.
   */
  isAuthenticated: (): boolean => {
    if (isServer) return false;
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Removes the token and username from localStorage (logout).
   */
  logout: (): void => {
    if (isServer) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USER_ID_KEY);
    window.dispatchEvent(new Event('auth-change'));
  },

  /**
   * Returns the Authorization header object for authenticated requests.
   */
  getAuthHeaders: (): Record<string, string> => {
    const token = authService.getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  },

  /**
   * Returns the decoded user object from the token.
   */
  getUser: (): any | null => {
    const token = authService.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const decoded = JSON.parse(atob(padded));
      
      return {
        id: decoded['nameid'] || decoded['sub'],
        username: decoded['unique_name'],
        role: decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      };
    } catch {
      return null;
    }
  },
};
