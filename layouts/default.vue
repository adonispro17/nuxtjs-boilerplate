<script setup lang="ts">
const { user, logout } = useAuth();
const route = useRoute();
const router = useRouter();

const links = [
  { to: '/', label: 'Panel', icon: '🕒' },
  { to: '/employees', label: 'Personal', icon: '🩺' },
  { to: '/devices', label: 'Dispositivos biométricos', icon: '🔒' },
  { to: '/reports', label: 'Reportes', icon: '📊' },
];

const visibleLinks = computed(() =>
  links.filter((l) => user.value?.role === 'admin' || (l.to !== '/employees' && l.to !== '/devices'))
);

async function handleLogout() {
  await logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">
    <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div class="px-5 py-5 border-b border-slate-800">
        <p class="text-xs uppercase tracking-widest text-sky-400 font-semibold">Hospital</p>
        <h1 class="text-lg font-bold leading-tight">Control de Enfermería</h1>
      </div>
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink
          v-for="link in visibleLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="route.path === link.to
            ? 'bg-sky-500 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <span>{{ link.icon }}</span>
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>
      <div class="px-4 py-4 border-t border-slate-800 text-sm">
        <p class="text-slate-400">Sesión activa</p>
        <p class="font-semibold">{{ user?.username }}</p>
        <p class="text-xs text-slate-500 uppercase">{{ user?.role }}</p>
        <button
          class="mt-3 w-full rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm py-1.5"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
    <main class="flex-1 p-6 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
