<script setup lang="ts">
import dayjs from 'dayjs';
import type { AttendanceRecord, Employee } from '~/types';

const records = ref<AttendanceRecord[]>([]);
const employees = ref<Employee[]>([]);
const selectedEmployeeId = ref('');
const actionLoading = ref(false);
const actionError = ref('');
const actionMessage = ref('');

let pollTimer: ReturnType<typeof setInterval> | null = null;

async function loadToday() {
  const { records: r } = await $fetch<{ records: AttendanceRecord[] }>('/api/attendance/today');
  records.value = r;
}

async function loadEmployees() {
  const { employees: e } = await $fetch<{ employees: Employee[] }>('/api/employees');
  employees.value = e.filter((emp) => emp.active);
}

const openCount = computed(() => records.value.filter((r) => !r.clockOutAt).length);
const closedCount = computed(() => records.value.filter((r) => r.clockOutAt).length);

const selectedEmployeeHasOpenRecord = computed(() => {
  if (!selectedEmployeeId.value) return false;
  return records.value.some((r) => r.employeeId === selectedEmployeeId.value && !r.clockOutAt);
});

async function handleClock(type: 'in' | 'out') {
  if (!selectedEmployeeId.value) return;
  actionLoading.value = true;
  actionError.value = '';
  actionMessage.value = '';
  try {
    await $fetch(`/api/attendance/clock-${type}`, {
      method: 'POST',
      body: { employeeId: selectedEmployeeId.value },
    });
    actionMessage.value = type === 'in' ? 'Entrada registrada' : 'Salida registrada';
    await loadToday();
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || 'No se pudo registrar la marca';
  } finally {
    actionLoading.value = false;
  }
}

function formatTime(value: string | null) {
  return value ? dayjs(value).format('HH:mm:ss') : '—';
}

function worked(record: AttendanceRecord) {
  const end = record.clockOutAt ? dayjs(record.clockOutAt) : dayjs();
  const start = dayjs(record.clockInAt);
  const minutes = end.diff(start, 'minute');
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

onMounted(async () => {
  await Promise.all([loadToday(), loadEmployees()]);
  pollTimer = setInterval(loadToday, 5000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-slate-800">Panel de asistencia</h1>
      <p class="text-slate-500 text-sm">
        {{ dayjs().format('dddd, D [de] MMMM [de] YYYY') }} · se actualiza automáticamente cada 5s
        (incluye marcas del lector biométrico)
      </p>
    </header>

    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-xs text-slate-500 uppercase font-semibold">En turno ahora</p>
        <p class="text-3xl font-bold text-sky-600">{{ openCount }}</p>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-xs text-slate-500 uppercase font-semibold">Turnos completados hoy</p>
        <p class="text-3xl font-bold text-emerald-600">{{ closedCount }}</p>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-xs text-slate-500 uppercase font-semibold">Personal activo</p>
        <p class="text-3xl font-bold text-slate-700">{{ employees.length }}</p>
      </div>
    </section>

    <section class="bg-white rounded-xl shadow p-5">
      <h2 class="font-semibold text-slate-800 mb-3">Marcar entrada / salida manual</h2>
      <p class="text-xs text-slate-500 mb-3">
        Uso normal: el personal marca con el lector biométrico. Este panel es para registrar
        manualmente en caso de falla del dispositivo.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="selectedEmployeeId"
          class="rounded-lg border border-slate-300 px-3 py-2 min-w-[220px]"
        >
          <option value="" disabled>Seleccionar empleado…</option>
          <option v-for="e in employees" :key="e.id" :value="e.id">
            {{ e.fullName }} — {{ e.employeeCode }}
          </option>
        </select>
        <button
          class="rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 font-medium"
          :disabled="!selectedEmployeeId || actionLoading || selectedEmployeeHasOpenRecord"
          @click="handleClock('in')"
        >
          Marcar entrada
        </button>
        <button
          class="rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 font-medium"
          :disabled="!selectedEmployeeId || actionLoading || !selectedEmployeeHasOpenRecord"
          @click="handleClock('out')"
        >
          Marcar salida
        </button>
      </div>
      <p v-if="actionMessage" class="text-sm text-emerald-600 mt-2">{{ actionMessage }}</p>
      <p v-if="actionError" class="text-sm text-red-600 mt-2">{{ actionError }}</p>
    </section>

    <section class="bg-white rounded-xl shadow">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="font-semibold text-slate-800">Asistencia de hoy</h2>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>
            <th class="text-left px-5 py-2">Empleado</th>
            <th class="text-left px-5 py-2">Entrada</th>
            <th class="text-left px-5 py-2">Salida</th>
            <th class="text-left px-5 py-2">Tiempo</th>
            <th class="text-left px-5 py-2">Origen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in records" :key="r.id" class="border-t border-slate-100">
            <td class="px-5 py-2">
              <p class="font-medium text-slate-800">{{ r.employeeName }}</p>
              <p class="text-xs text-slate-400">{{ r.employeeCode }}</p>
            </td>
            <td class="px-5 py-2">{{ formatTime(r.clockInAt) }}</td>
            <td class="px-5 py-2">
              <span v-if="r.clockOutAt">{{ formatTime(r.clockOutAt) }}</span>
              <span v-else class="text-sky-600 font-medium">En turno</span>
            </td>
            <td class="px-5 py-2">{{ worked(r) }}</td>
            <td class="px-5 py-2">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="r.clockInSource === 'biometric' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ r.clockInSource === 'biometric' ? 'Biométrico' : 'Manual' }}
              </span>
            </td>
          </tr>
          <tr v-if="records.length === 0">
            <td colspan="5" class="px-5 py-6 text-center text-slate-400">
              Aún no hay marcas de asistencia hoy.
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
