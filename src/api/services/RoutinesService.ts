import { BaseApiService, type IWriteOptions } from './BaseApiService';
import type {
  AssignRoutineRequest,
  CreateExerciseRequest,
  CreateRoutineRequest,
  Exercise,
  LogWorkoutRequest,
  MemberRoutineBundle,
  Routine,
  RoutineAssignment,
  RoutineDetail,
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

  async assignRoutine(
    body: AssignRoutineRequest,
    options?: IWriteOptions,
  ): Promise<RoutineAssignment> {
    return this.post('/api/routines/assign', body, options);
  }

  async getMemberAssignment(
    memberId: string,
  ): Promise<RoutineAssignment | null> {
    return this.get(`/api/routines/member/${memberId}/assignment`);
  }

  // ─── Miembro autenticado (offline-first) ─────────────────────────────────
  async getMyRoutine(): Promise<MemberRoutineBundle> {
    return this.get('/api/routines/me');
  }

  async getMyHistory(limit?: number): Promise<WorkoutLog[]> {
    return this.get('/api/routines/me/history', limit ? { limit } : undefined);
  }

  async logWorkout(
    body: LogWorkoutRequest,
    options?: IWriteOptions,
  ): Promise<WorkoutLog> {
    return this.post('/api/routines/me/logs', body, options);
  }
}
