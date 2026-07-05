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

/** Mapeo dia de semana -> id del routine_day. Claves ausentes = descanso. */
export type DayMapping = Partial<Record<Weekday, string>>;

// ─── Catalogo de ejercicios ────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  muscleGroup?: string | null;
  equipment?: string | null;
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
  orderIndex: number;
  sets: number;
  reps: string;
  weight?: string | null;
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

// ─── Asignacion + bundle del miembro ───────────────────────────────────────

export interface RoutineAssignment {
  id: string;
  memberId: string;
  routineId: string;
  assignedBy?: string | null;
  dayMapping: DayMapping;
  startsAt: string;
  endsAt?: string | null;
  status: 'active' | 'paused' | 'finished';
  createdAt: string;
  updatedAt: string;
}

/** Lo que devuelve GET /routines/me. */
export interface MemberRoutineBundle {
  assignment: RoutineAssignment | null;
  routine: RoutineDetail | null;
}

/** Vista derivada en el cliente para "lo que toca hoy". */
export interface TodayWorkout {
  weekday: Weekday;
  routineName: string | null;
  day: RoutineDay | null;
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
}

export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  isActive?: boolean;
}

export interface CreateRoutineExerciseRequest {
  exerciseId?: string;
  exerciseName: string;
  orderIndex?: number;
  sets: number;
  reps: string;
  weight?: string;
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

export interface AssignRoutineRequest {
  routineId: string;
  memberId: string;
  dayMapping: DayMapping;
  startsAt?: string;
  endsAt?: string;
}

export interface LogSetRequest {
  routineExerciseId?: string;
  exerciseName: string;
  setNumber: number;
  repsDone?: number;
  weightDone?: number;
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
