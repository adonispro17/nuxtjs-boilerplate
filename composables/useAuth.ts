import type { SessionUser } from '~/types';

export function useAuth() {
  const user = useState<SessionUser | null>('auth-user', () => null);

  async function fetchMe() {
    try {
      const { user: me } = await $fetch<{ user: SessionUser }>('/api/auth/me');
      user.value = me;
    } catch {
      user.value = null;
    }
    return user.value;
  }

  async function login(username: string, password: string) {
    const { user: me } = await $fetch<{ user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    user.value = me;
    return me;
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
  }

  return { user, fetchMe, login, logout };
}
