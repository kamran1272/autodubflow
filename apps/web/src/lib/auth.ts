export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const payload = await parseApiResponse<T>(response);

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? String((payload as { error?: string }).error)
        : typeof payload === 'object' && payload !== null && 'message' in payload
          ? String((payload as { message?: string }).message)
          : 'Request failed.';

    throw new Error(errorMessage);
  }

  return payload;
}

export async function loadSession(): Promise<AuthUser | null> {
  try {
    const payload = await request<{ user?: AuthUser; session?: { user?: AuthUser } }>(`/api/auth/get-session`);
    const user = payload?.user ?? payload?.session?.user ?? null;
    return user ?? null;
  } catch {
    return null;
  }
}

export async function signInWithEmail(input: { email: string; password: string }) {
  return request<{ user?: AuthUser; token?: string }>(`/api/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });
}

export async function signUpWithEmail(input: { name: string; email: string; password: string }) {
  return request<{ user?: AuthUser; token?: string }>(`/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
    }),
  });
}

export async function signOut() {
  return request<{ success?: boolean }>(`/api/auth/sign-out`, {
    method: 'POST',
  });
}

export async function requestPasswordReset(email: string) {
  return request<{ success?: boolean }>(`/api/auth/forget-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: { token: string; password: string }) {
  return request<{ success?: boolean }>(`/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: input.token,
      newPassword: input.password,
    }),
  });
}

export async function updateUserProfile(input: { name?: string; email?: string; image?: string | null }) {
  return request<{ user?: AuthUser }>(`/api/auth/update-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}
