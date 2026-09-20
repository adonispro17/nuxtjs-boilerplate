<script setup lang="ts">
import type { Employee } from '~/types';

const employees = ref<Employee[]>([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const showForm = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  employeeCode: '',
  fullName: '',
  role: 'Enfermera/o',
  department: 'Enfermería',
  email: '',
  biometricId: '',
});

function resetForm() {
  form.employeeCode = '';
  form.fullName = '';
  form.role = 'Enfermera/o';
  form.department = 'Enfermería';
  form.email = '';
  form.biometricId = '';
  editingId.value = null;
}

async function load() {
  loading.value = true;
  try {
    const { employees: e } = await $fetch<{ employees: Employee[] }>('/api/employees');
    employees.value = e;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  showForm.value = true;
}

function openEdit(emp: Employee) {
  editingId.value = emp.id;
  form.employeeCode = emp.employeeCode;
  form.fullName = emp.fullName;
  form.role = emp.role;
  form.department = emp.department;
  form.email = emp.email || '';
  form.biometricId = emp.biometricId || '';
  showForm.value = true;
}

async function submit() {
  error.value = '';
  success.value = '';
  try {
    if (editingId.value) {
      await $fetch(`/api/employees/${editingId.value}`, {
        method: 'PATCH',
        body: {
          fullName: form.fullName,
          role: form.role,
          department: form.department,
          email: form.email,
          biometricId: form.biometricId,
        },
      });
      success.value = 'Empleado actualizado';
    } else {
      await $fetch('/api/employees', { method: 'POST', body: { ...form } });
      success.value = 'Empleado creado';
    }
    showForm.value = false;
    resetForm();
    await load();
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Ocurrió un error';
  }
}

async function toggleActive(emp: Employee) {
  await $fetch(`/api/employees/${emp.id}`, {
    method: 'PATCH',
    body: { active: !emp.active },
  });
  await load();
}

async function remove(emp: Employee) {
  error.value = '';
  if (!confirm(`¿Eliminar a ${emp.fullName}? Esta acción no se puede deshacer.`)) return;
  try {
    await $fetch(`/api/employees/${emp.id}`, { method: 'DELETE' });
    await load();
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'No se pudo eliminar';
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Personal de enfermería</h1>
        <p class="text-slate-500 text-sm">Administra el personal y sus IDs biométricos</p>
      </div>
      <button
        class="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 font-medium"
        @click="openCreate"
      >
        + Nuevo empleado
      </button>
    </header>

    <p v-if="success" class="text-sm text-emerald-600">{{ success }}</p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-if="showForm" class="bg-white rounded-xl shadow p-5">
      <h2 class="font-semibold text-slate-800 mb-3">
        {{ editingId ? 'Editar empleado' : 'Nuevo empleado' }}
      </h2>
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Código de empleado</label>
          <input
            v-model="form.employeeCode"
            :disabled="!!editingId"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
          <input v-model="form.fullName" required class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Rol</label>
          <input v-model="form.role" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
          <input v-model="form.department" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Correo</label>
          <input v-model="form.email" type="email" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ID biométrico</label>
          <input
            v-model="form.biometricId"
            placeholder="Ej. BIO-0004 (huella/rostro enrolado en el dispositivo)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div class="sm:col-span-2 flex gap-3">
          <button type="submit" class="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 font-medium">
            Guardar
          </button>
          <button
            type="button"
            class="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 font-medium"
            @click="showForm = false"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>
            <th class="text-left px-5 py-2">Código</th>
            <th class="text-left px-5 py-2">Nombre</th>
            <th class="text-left px-5 py-2">Rol</th>
            <th class="text-left px-5 py-2">ID biométrico</th>
            <th class="text-left px-5 py-2">Estado</th>
            <th class="text-right px-5 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in employees" :key="e.id" class="border-t border-slate-100">
            <td class="px-5 py-2 font-mono text-xs">{{ e.employeeCode }}</td>
            <td class="px-5 py-2 font-medium text-slate-800">{{ e.fullName }}</td>
            <td class="px-5 py-2">{{ e.role }}</td>
            <td class="px-5 py-2 font-mono text-xs">{{ e.biometricId || '—' }}</td>
            <td class="px-5 py-2">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="e.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ e.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-5 py-2 text-right space-x-2">
              <button class="text-sky-600 hover:underline" @click="openEdit(e)">Editar</button>
              <button class="text-amber-600 hover:underline" @click="toggleActive(e)">
                {{ e.active ? 'Desactivar' : 'Activar' }}
              </button>
              <button class="text-red-600 hover:underline" @click="remove(e)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="!loading && employees.length === 0">
            <td colspan="6" class="px-5 py-6 text-center text-slate-400">Sin empleados registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
