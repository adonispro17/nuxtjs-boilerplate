<script setup lang="ts">
import dayjs from 'dayjs';
import type { Device } from '~/types';

const devices = ref<Device[]>([]);
const showForm = ref(false);
const form = reactive({ name: '', location: '' });
const error = ref('');
const newDeviceInfo = ref<{ id: string; apiKey: string } | null>(null);
const revealedKeys = reactive<Record<string, boolean>>({});

async function load() {
  const { devices: d } = await $fetch<{ devices: Device[] }>('/api/devices');
  devices.value = d;
}

async function submit() {
  error.value = '';
  try {
    const res = await $fetch<{ id: string; apiKey: string }>('/api/devices', {
      method: 'POST',
      body: { ...form },
    });
    newDeviceInfo.value = res;
    form.name = '';
    form.location = '';
    showForm.value = false;
    await load();
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'No se pudo registrar el dispositivo';
  }
}

async function remove(device: Device) {
  if (!confirm(`¿Eliminar el dispositivo "${device.name}"?`)) return;
  await $fetch(`/api/devices/${device.id}`, { method: 'DELETE' });
  await load();
}

function maskKey(key: string) {
  return `${key.slice(0, 6)}${'•'.repeat(20)}${key.slice(-4)}`;
}

function formatDate(value: string | null) {
  return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'Nunca';
}

const webhookUrl = computed(() => {
  if (process.client) return `${window.location.origin}/api/biometric/webhook`;
  return '/api/biometric/webhook';
});

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dispositivos biométricos</h1>
        <p class="text-slate-500 text-sm">Lectores de huella/rostro conectados al sistema</p>
      </div>
      <button
        class="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 font-medium"
        @click="showForm = !showForm"
      >
        + Registrar dispositivo
      </button>
    </header>

    <div class="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-900">
      <p class="font-semibold mb-1">Cómo conectar un lector biométrico</p>
      <p class="mb-2">
        Registra el dispositivo aquí para obtener una <code>api_key</code>. El lector (o un
        "bridge"/agente local que traduzca el protocolo propietario del fabricante, por ejemplo
        ZKTeco, Suprema, Hikvision o ANVIZ) debe hacer una petición HTTP cada vez que alguien
        marca su huella o rostro:
      </p>
      <pre class="bg-white rounded-lg p-3 overflow-x-auto text-xs border border-sky-100">POST {{ webhookUrl }}
Headers: x-api-key: &lt;api_key del dispositivo&gt;
Body: { "biometricId": "BIO-0001" }</pre>
      <p class="mt-2 text-xs text-sky-800">
        El campo <code>biometricId</code> es el identificador que el propio lector asigna al
        enrolar la huella/rostro; se configura en la ficha de cada empleado. Si no se envía
        <code>"type": "in" | "out"</code>, el sistema detecta automáticamente si es entrada o
        salida.
      </p>
    </div>

    <div v-if="newDeviceInfo" class="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm">
      <p class="font-semibold text-amber-800">
        Dispositivo creado. Copia esta llave ahora, no se mostrará de nuevo completa:
      </p>
      <code class="block mt-2 bg-white rounded-lg p-2 border border-amber-200 break-all">{{ newDeviceInfo.apiKey }}</code>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-if="showForm" class="bg-white rounded-xl shadow p-5">
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input v-model="form.name" required class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
          <input v-model="form.location" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div class="sm:col-span-2">
          <button type="submit" class="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 font-medium">
            Registrar
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>
            <th class="text-left px-5 py-2">Nombre</th>
            <th class="text-left px-5 py-2">Ubicación</th>
            <th class="text-left px-5 py-2">API Key</th>
            <th class="text-left px-5 py-2">Última actividad</th>
            <th class="text-right px-5 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in devices" :key="d.id" class="border-t border-slate-100">
            <td class="px-5 py-2 font-medium text-slate-800">{{ d.name }}</td>
            <td class="px-5 py-2">{{ d.location || '—' }}</td>
            <td class="px-5 py-2 font-mono text-xs">
              <button class="text-sky-600 hover:underline" @click="revealedKeys[d.id] = !revealedKeys[d.id]">
                {{ revealedKeys[d.id] ? d.apiKey : maskKey(d.apiKey) }}
              </button>
            </td>
            <td class="px-5 py-2 text-xs text-slate-500">{{ formatDate(d.lastSeenAt) }}</td>
            <td class="px-5 py-2 text-right">
              <button class="text-red-600 hover:underline" @click="remove(d)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="devices.length === 0">
            <td colspan="5" class="px-5 py-6 text-center text-slate-400">Sin dispositivos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
