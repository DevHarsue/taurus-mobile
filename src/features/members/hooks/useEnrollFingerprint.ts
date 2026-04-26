import { useEffect, useRef, useState, useCallback } from 'react';
import { membersService } from '@api/services';
import type {
  EnrollmentSession,
  EnrollmentStep,
  EnrollmentStatus,
} from '@api/services/MembersService';

const POLL_INTERVAL_MS = 700;

export interface EnrollState {
  status: EnrollmentStatus | 'idle';
  step: EnrollmentStep | 'idle';
  message: string;
  fingerprintId?: number;
  error: string | null;
  starting: boolean;
}

const idleState: EnrollState = {
  status: 'idle',
  step: 'idle',
  message: '',
  error: null,
  starting: false,
};

export function useEnrollFingerprint(memberId: string, deviceId: string) {
  const [state, setState] = useState<EnrollState>(idleState);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
    activeRef.current = false;
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await membersService.getEnrollmentStatus(memberId);
      if (result.status === 'idle') {
        return;
      }
      const session = result as EnrollmentSession;
      setState((prev) => ({
        ...prev,
        status: session.status,
        step: session.step,
        message: session.message,
        fingerprintId: session.fingerprintId,
      }));

      if (session.status !== 'in_progress') {
        stopPolling();
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: (error as Error).message ?? 'Error consultando estado',
      }));
    }
  }, [memberId, stopPolling]);

  const start = useCallback(async () => {
    setState({ ...idleState, starting: true });
    try {
      const session = await membersService.startEnrollment(memberId, deviceId);
      setState({
        starting: false,
        status: session.status,
        step: session.step,
        message: session.message,
        fingerprintId: session.fingerprintId,
        error: null,
      });
      activeRef.current = true;
      pollerRef.current = setInterval(() => {
        if (activeRef.current) {
          void fetchStatus();
        }
      }, POLL_INTERVAL_MS);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ??
        (error as Error).message ??
        'No se pudo iniciar el enrolamiento';
      setState({ ...idleState, error: message });
    }
  }, [memberId, deviceId, fetchStatus]);

  const cancel = useCallback(async () => {
    try {
      await membersService.cancelEnrollment(memberId);
    } catch {
      // ignore
    }
    stopPolling();
    setState((prev) => ({
      ...prev,
      status: 'failed',
      step: 'done',
      message: 'Cancelado',
    }));
  }, [memberId, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setState(idleState);
  }, [stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { state, start, cancel, reset };
}
