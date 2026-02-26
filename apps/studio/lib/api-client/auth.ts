/**
 * Studio auth client: login and logout against Payload built-in routes.
 * Use same-origin fetch with credentials so session cookie is sent and set.
 */

import { API_ROUTES } from './routes';

export async function login(email: string, password: string): Promise<{ user: unknown }> {
  const res = await fetch(API_ROUTES.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    let message = 'Sign in failed';
    try {
      const body = (await res.json()) as { message?: string; errors?: Array<{ message?: string }> };
      if (typeof body?.message === 'string' && body.message.trim()) message = body.message;
      else if (Array.isArray(body?.errors) && typeof body.errors[0]?.message === 'string' && body.errors[0].message.trim()) {
        message = body.errors[0].message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json() as Promise<{ user: unknown }>;
}

export async function logout(credentials: RequestCredentials = 'include'): Promise<void> {
  const res = await fetch(API_ROUTES.LOGOUT, {
    method: 'POST',
    credentials,
  });
  // Payload returns 400 "No User" when there is no session (e.g. after first logout or double-click)
  if (res.status === 400) {
    try {
      const body = (await res.json()) as { message?: string };
      if (typeof body?.message === 'string' && /no user/i.test(body.message)) {
        return; // already logged out
      }
    } catch {
      // ignore
    }
  }
  if (!res.ok) {
    throw new Error('Log out failed');
  }
}
