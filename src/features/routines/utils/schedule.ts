import type {
  MemberRoutineBundle,
  RoutineDay,
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

/** Resuelve el routine_day asignado a un dia de semana concreto. */
export function dayForWeekday(
  bundle: MemberRoutineBundle | null,
  weekday: Weekday,
): RoutineDay | null {
  if (!bundle?.assignment || !bundle.routine) return null;
  const dayId = bundle.assignment.dayMapping[weekday];
  if (!dayId) return null;
  return bundle.routine.days.find((d) => d.id === dayId) ?? null;
}

/** Deriva "lo que toca hoy" 100% en el cliente (funciona offline). */
export function deriveTodayWorkout(
  bundle: MemberRoutineBundle | null,
): TodayWorkout {
  const weekday = getCurrentWeekday();
  const day = dayForWeekday(bundle, weekday);
  return {
    weekday,
    routineName: bundle?.routine?.name ?? null,
    day,
    isRestDay: !day,
  };
}

/** Cuenta total de series prescritas en un dia (para resumenes). */
export function totalSets(day: RoutineDay | null): number {
  if (!day) return 0;
  return day.exercises.reduce((sum, ex) => sum + (ex.sets ?? 0), 0);
}
