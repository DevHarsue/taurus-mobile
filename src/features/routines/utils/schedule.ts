import type {
  MemberSchedule,
  RoutineExercise,
  ScheduledDay,
  TodayWorkout,
  Weekday,
} from '@app-types/routine';

// JS getDay(): 0 = domingo ... 6 = sabado.
const JS_DAY_TO_WEEKDAY: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function getCurrentWeekday(): Weekday {
  return JS_DAY_TO_WEEKDAY[new Date().getDay()];
}

/** El día programado (rutina + día) para un día de la semana concreto. */
export function dayForWeekday(
  schedule: MemberSchedule | null,
  weekday: Weekday,
): ScheduledDay | null {
  // Defensivo: si el caché trae un formato viejo/no-array, tratar como vacío.
  if (!Array.isArray(schedule)) return null;
  return schedule.find((s) => s.weekday === weekday) ?? null;
}

/** Deriva "lo que toca hoy" 100% en el cliente (funciona offline). */
export function deriveTodayWorkout(
  schedule: MemberSchedule | null,
): TodayWorkout {
  const weekday = getCurrentWeekday();
  const day = dayForWeekday(schedule, weekday);
  return { weekday, day, isRestDay: !day };
}

/** Total de series prescritas en un día (para resúmenes). */
export function totalSets(day: ScheduledDay | null): number {
  if (!day) return 0;
  return day.exercises.reduce((sum, ex) => sum + (ex.sets ?? 0), 0);
}

/** Línea de prescripción legible según el tipo de medición del ejercicio. */
export function prescriptionLine(ex: RoutineExercise): string {
  const parts: string[] = [`${ex.sets} series`];
  switch (ex.measurementType) {
    case 'time':
      parts.push(ex.durationSeconds ? `${ex.durationSeconds}s` : 'tiempo');
      break;
    case 'distance':
      parts.push(ex.distance ? ex.distance : 'distancia');
      break;
    case 'reps':
      parts.push(`${ex.reps} reps`);
      break;
    case 'weight_reps':
    default:
      parts.push(`${ex.reps} reps`);
      if (ex.weight) parts.push(ex.weight);
      break;
  }
  if (ex.restSeconds) parts.push(`${ex.restSeconds}s desc.`);
  return parts.join('  ·  ');
}
