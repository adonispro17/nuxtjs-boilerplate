export interface SessionUser {
  id: string;
  username: string;
  role: 'admin' | 'supervisor' | 'nurse';
  employeeId: string | null;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  role: string;
  department: string;
  email: string | null;
  biometricId: string | null;
  active: number;
  createdAt: string;
}

export interface Device {
  id: string;
  name: string;
  location: string | null;
  apiKey: string;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  clockInAt: string;
  clockOutAt: string | null;
  clockInSource: 'manual' | 'biometric';
  clockOutSource: 'manual' | 'biometric' | null;
}
