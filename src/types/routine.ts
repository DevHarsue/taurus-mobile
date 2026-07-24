// ─── Dominio de rutinas (espejo del members-service) ───────────────────────

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  monday: 'LUN',
  tuesday: 'MAR',
  wednesday: 'MIÉ',
  thursday: 'JUE',
  friday: 'VIE',
  saturday: 'SÁB',
  sunday: 'DOM',
};

export type RoutineLevel = 'beginner' | 'intermediate' | 'advanced';

export const LEVEL_LABELS: Record<RoutineLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

// ─── Tipos de medición ─────────────────────────────────────────────────────

export type MeasurementType = 'weight_reps' | 'reps' | 'time' | 'distance';

export const MEASUREMENT_TYPES: MeasurementType[] = [
  'weight_reps',
  'reps',
  'time',
  'distance',
];

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  weight_reps: 'Peso y reps',
  reps: 'Repeticiones',
  time: 'Tiempo',
  distance: 'Distancia',
};

export const MEASUREMENT_HINT: Record<MeasurementType, string> = {
  weight_reps: 'Sentadilla, press banca…',
  reps: 'Dominadas, flexiones…',
  time: 'Plancha, isométricos…',
  distance: 'Correr, remo, caminata…',
};

// ─── Catálogo de ejercicios ────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  muscleGroup?: string | null;
  equipment?: string | null;
  measurementType: MeasurementType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Plantilla de rutina ───────────────────────────────────────────────────

export interface RoutineExercise {
  id: string;
  routineDayId: string;
  exerciseId?: string | null;
  exerciseName: string;
  measurementType: MeasurementType;
  orderIndex: number;
  sets: number;
  reps: string;
  weight?: string | null;
  durationSeconds?: number | null;
  distance?: string | null;
  restSeconds?: number | null;
  rpe?: string | null;
  notes?: string | null;
}

export interface RoutineDay {
  id: string;
  routineId: string;
  label: string;
  orderIndex: number;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string;
  description?: string | null;
  level: RoutineLevel;
  goal?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineDetail extends Routine {
  days: RoutineDay[];
}

// ─── Horario semanal del miembro ───────────────────────────────────────────

/** Un día del horario semanal, ya resuelto con su rutina/día/ejercicios. */
export interface ScheduledDay {
  weekday: Weekday;
  routineId: string;
  routineName: string;
  routineDayId: string;
  dayLabel: string;
  exercises: RoutineExercise[];
}

/** GET /routines/me y /routines/member/:id/schedule devuelven esto. */
export type MemberSchedule = ScheduledDay[];

/** Vista derivada en el cliente para "lo que toca hoy". */
export interface TodayWorkout {
  weekday: Weekday;
  day: ScheduledDay | null;
  isRestDay: boolean;
}

// ─── Diario de entrenamiento ───────────────────────────────────────────────

export interface SetLog {
  id: string;
  routineExerciseId?: string | null;
  exerciseName: string;
  setNumber: number;
  repsDone?: number | null;
  weightDone?: number | null;
  durationDone?: number | null;
  distanceDone?: number | null;
  done: boolean;
}

export interface WorkoutLog {
  id: string;
  memberId: string;
  assignmentId?: string | null;
  routineDayId?: string | null;
  dayLabel?: string | null;
  performedOn: string;
  status: 'completed' | 'partial' | 'skipped';
  notes?: string | null;
  createdAt: string;
  sets: SetLog[];
}

// ─── Request DTOs ──────────────────────────────────────────────────────────

export interface CreateExerciseRequest {
  name: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  measurementType?: MeasurementType;
}

export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  measurementType?: MeasurementType;
  isActive?: boolean;
}

export interface CreateRoutineExerciseRequest {
  exerciseId?: string;
  exerciseName: string;
  measurementType?: MeasurementType;
  orderIndex?: number;
  sets: number;
  reps: string;
  weight?: string;
  durationSeconds?: number;
  distance?: string;
  restSeconds?: number;
  rpe?: string;
  notes?: string;
}

export interface CreateRoutineDayRequest {
  label: string;
  orderIndex?: number;
  exercises: CreateRoutineExerciseRequest[];
}

export interface CreateRoutineRequest {
  name: string;
  description?: string;
  level: RoutineLevel;
  goal?: string;
  days: CreateRoutineDayRequest[];
}

export type UpdateRoutineRequest = Partial<CreateRoutineRequest> & {
  isActive?: boolean;
};

export interface ScheduleEntry {
  weekday: Weekday;
  routineId: string;
  routineDayId: string;
}

export interface SetScheduleRequest {
  entries: ScheduleEntry[];
}

export interface LogSetRequest {
  routineExerciseId?: string;
  exerciseName: string;
  setNumber: number;
  repsDone?: number;
  weightDone?: number;
  durationDone?: number;
  distanceDone?: number;
  done?: boolean;
}

export interface LogWorkoutRequest {
  assignmentId?: string;
  routineDayId?: string;
  dayLabel?: string;
  performedOn?: string;
  status?: 'completed' | 'partial' | 'skipped';
  notes?: string;
  clientId?: string;
  sets: LogSetRequest[];
}
