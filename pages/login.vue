<script setup lang="ts">
definePageMeta({ layout: 'blank' });

const { login } = useAuth();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await login(username.value, password.value);
    await router.push('/');
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'No se pudo iniciar sesión';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-6">
        <p class="text-xs uppercase tracking-widest text-sky-600 font-semibold">Hospital</p>
        <h1 class="text-xl font-bold text-slate-800">Control de Enfermería</h1>
        <p class="text-sm text-slate-500 mt-1">Entrada y salida del personal</p>
      </div>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-medium py-2.5"
        >
          {{ loading ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
      <p class="text-xs text-slate-400 mt-6 text-center">
        Usuario inicial: <strong>admin</strong> — revise la consola del servidor para la contraseña generada.
      </p>
    </div>
  </div>
</template>
