import { BaseApiService, type IWriteOptions } from './BaseApiService';
import type {
  CreateExerciseRequest,
  CreateRoutineRequest,
  Exercise,
  LogWorkoutRequest,
  MemberSchedule,
  Routine,
  RoutineDetail,
  SetScheduleRequest,
  UpdateExerciseRequest,
  UpdateRoutineRequest,
  WorkoutLog,
} from '@app-types/routine';

export class RoutinesService extends BaseApiService {
  // ─── Catalogo de ejercicios (admin) ──────────────────────────────────────
  async getExercises(): Promise<Exercise[]> {
    return this.get('/api/exercises');
  }

  async createExercise(
    body: CreateExerciseRequest,
    options?: IWriteOptions,
  ): Promise<Exercise> {
    return this.post('/api/exercises', body, options);
  }

  async updateExercise(
    id: string,
    body: UpdateExerciseRequest,
    options?: IWriteOptions,
  ): Promise<Exercise> {
    return this.put(`/api/exercises/${id}`, body, options);
  }

  async deleteExercise(id: string, options?: IWriteOptions): Promise<void> {
    return this.delete(`/api/exercises/${id}`, undefined, options);
  }

  // ─── Plantillas de rutina (admin) ────────────────────────────────────────
  async getRoutines(): Promise<Routine[]> {
    return this.get('/api/routines');
  }

  async getRoutine(id: string): Promise<RoutineDetail> {
    return this.get(`/api/routines/${id}`);
  }

  async createRoutine(
    body: CreateRoutineRequest,
    options?: IWriteOptions,
  ): Promise<RoutineDetail> {
    return this.post('/api/routines', body, options);
  }

  async updateRoutine(
    id: string,
    body: UpdateRoutineRequest,
    options?: IWriteOptions,
  ): Promise<RoutineDetail> {
    return this.put(`/api/routines/${id}`, body, options);
  }

  async deleteRoutine(id: string, options?: IWriteOptions): Promise<void> {
    return this.delete(`/api/routines/${id}`, undefined, options);
  }

  // ─── Horario semanal de un miembro (admin) ───────────────────────────────
  async getMemberSchedule(memberId: string): Promise<MemberSchedule> {
    return this.get(`/api/routines/member/${memberId}/schedule`);
  }

  async setMemberSchedule(
    memberId: string,
    body: SetScheduleRequest,
    options?: IWriteOptions,
  ): Promise<MemberSchedule> {
    return this.put(`/api/routines/member/${memberId}/schedule`, body, options);
  }

  // ─── Miembro autenticado (offline-first) ─────────────────────────────────
  async getMySchedule(): Promise<MemberSchedule> {
    return this.get('/api/routines/me');
  }

  async getMyHistory(limit?: number): Promise<WorkoutLog[]> {
    return this.get('/api/routines/me/history', limit ? { limit } : undefined);
  }

  /** Historial de entrenamientos de un miembro (seguimiento admin). */
  async getMemberHistory(memberId: string, limit?: number): Promise<WorkoutLog[]> {
    return this.get(
      `/api/routines/member/${memberId}/history`,
      limit ? { limit } : undefined,
    );
  }

  async logWorkout(
    body: LogWorkoutRequest,
    options?: IWriteOptions,
  ): Promise<WorkoutLog> {
    return this.post('/api/routines/me/logs', body, options);
  }
}
