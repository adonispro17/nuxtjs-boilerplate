<script setup lang="ts">
import dayjs from 'dayjs';
import type { AttendanceRecord, Employee } from '~/types';

const records = ref<AttendanceRecord[]>([]);
const employees = ref<Employee[]>([]);
const loading = ref(false);

const filters = reactive({
  from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  to: dayjs().format('YYYY-MM-DD'),
  employeeId: '',
});

async function loadEmployees() {
  const { employees: e } = await $fetch<{ employees: Employee[] }>('/api/employees');
  employees.value = e;
}

async function loadReport() {
  loading.value = true;
  try {
    const { records: r } = await $fetch<{ records: AttendanceRecord[] }>('/api/attendance/history', {
      query: {
        from: filters.from,
        to: filters.to,
        employeeId: filters.employeeId || undefined,
      },
    });
    records.value = r;
  } finally {
    loading.value = false;
  }
}

function formatDateTime(value: string | null) {
  return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';
}

function hoursWorked(r: AttendanceRecord) {
  if (!r.clockOutAt) return '—';
  const minutes = dayjs(r.clockOutAt).diff(dayjs(r.clockInAt), 'minute');
  return (minutes / 60).toFixed(2);
}

function exportCsv() {
  const header = ['Empleado', 'Código', 'Departamento', 'Entrada', 'Salida', 'Horas', 'Origen entrada', 'Origen salida'];
  const rows = records.value.map((r) => [
    r.employeeName,
    r.employeeCode,
    r.department || '',
    formatDateTime(r.clockInAt),
    formatDateTime(r.clockOutAt),
    hoursWorked(r),
    r.clockInSource,
    r.clockOutSource || '',
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `asistencia_${filters.from}_a_${filters.to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(async () => {
  await Promise.all([loadEmployees(), loadReport()]);
});
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-slate-800">Reportes de asistencia</h1>
      <p class="text-slate-500 text-sm">Consulta el historial de entradas y salidas del personal</p>
    </header>

    <div class="bg-white rounded-xl shadow p-5 flex flex-wrap items-end gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Desde</label>
        <input v-model="filters.from" type="date" class="rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
        <input v-model="filters.to" type="date" class="rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Empleado</label>
        <select v-model="filters.employeeId" class="rounded-lg border border-slate-300 px-3 py-2 min-w-[200px]">
          <option value="">Todos</option>
          <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.fullName }}</option>
        </select>
      </div>
      <button class="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 font-medium" @click="loadReport">
        Filtrar
      </button>
      <button
        class="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 font-medium"
        :disabled="records.length === 0"
        @click="exportCsv"
      >
        Exportar CSV
      </button>
    </div>

    <div class="bg-white rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>
            <th class="text-left px-5 py-2">Empleado</th>
            <th class="text-left px-5 py-2">Departamento</th>
            <th class="text-left px-5 py-2">Entrada</th>
            <th class="text-left px-5 py-2">Salida</th>
            <th class="text-left px-5 py-2">Horas</th>
            <th class="text-left px-5 py-2">Origen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in records" :key="r.id" class="border-t border-slate-100">
            <td class="px-5 py-2">
              <p class="font-medium text-slate-800">{{ r.employeeName }}</p>
              <p class="text-xs text-slate-400">{{ r.employeeCode }}</p>
            </td>
            <td class="px-5 py-2">{{ r.department }}</td>
            <td class="px-5 py-2">{{ formatDateTime(r.clockInAt) }}</td>
            <td class="px-5 py-2">{{ formatDateTime(r.clockOutAt) }}</td>
            <td class="px-5 py-2">{{ hoursWorked(r) }}</td>
            <td class="px-5 py-2 text-xs">
              {{ r.clockInSource === 'biometric' ? 'Biométrico' : 'Manual' }}
              <span v-if="r.clockOutAt"> / {{ r.clockOutSource === 'biometric' ? 'Biométrico' : 'Manual' }}</span>
            </td>
          </tr>
          <tr v-if="!loading && records.length === 0">
            <td colspan="6" class="px-5 py-6 text-center text-slate-400">
              No hay registros para el rango seleccionado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
