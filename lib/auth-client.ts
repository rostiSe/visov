import { createAuthClient } from "better-auth/react"

type SessionUser = {
  id: string;
  email?: string;
  name?: string;
};

type SessionResponse = {
  user?: SessionUser;
};

type AuthClient = {
  signUp: (credentials: { email: string; password: string; name?: string }) => Promise<{ 
    data: any; 
    error: string | null;
    user?: SessionUser;
  }>;
  
  signIn: (credentials: { email: string; password: string }) => Promise<{ 
    data: any; 
    error: string | null;
  }>;
  
  signOut: () => Promise<void>;
  
  getSession: (options?: { 
    headers?: Headers | Record<string, string>;
  }) => Promise<SessionResponse>;
  
  api: {
    getSession: (options: { 
      headers: Headers | Record<string, string>;
    }) => Promise<SessionResponse>;
  };
};

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
}) as unknown as AuthClient;

export const signUp = async (email: string, password: string, name?: string) => {
  try {
    const response = await authClient.signUp({ email, password, ...(name && { name }) });
    return { data: response, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to sign up' 
    };
  }
};