import { useMemo } from 'react';
import { useToastContext } from '@context/ToastContext';
import type { ToastVariant } from '@components/Toast';

export interface IToastApi {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  show: (message: string, variant?: ToastVariant, duration?: number) => void;
}

/**
 * Hook para mostrar toasts desde cualquier componente:
 *   const { toast } = useToast();
 *   toast.success('Miembro creado correctamente');
 *   toast.error('Algo salio mal');
 */
export function useToast(): { toast: IToastApi } {
  const { showToast } = useToastContext();

  return useMemo(
    () => ({
      toast: {
        success: (m: string, d?: number) => showToast(m, 'success', d),
        error: (m: string, d?: number) => showToast(m, 'error', d),
        warning: (m: string, d?: number) => showToast(m, 'warning', d),
        info: (m: string, d?: number) => showToast(m, 'info', d),
        show: (m: string, v?: ToastVariant, d?: number) => showToast(m, v, d),
      },
    }),
    [showToast],
  );
}
