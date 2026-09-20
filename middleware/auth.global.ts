export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return;

  const { user, fetchMe } = useAuth();

  if (user.value === null) {
    await fetchMe();
  }

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }
  if (user.value && to.path === '/login') {
    return navigateTo('/');
  }
});
