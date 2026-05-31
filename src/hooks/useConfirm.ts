import { useConfirmContext } from '@context/ConfirmModalContext';

/**
 * Hook para abrir el modal de confirmacion reutilizable.
 * Devuelve `confirm(options) => Promise<boolean>`.
 */
export function useConfirm() {
  const { confirm } = useConfirmContext();
  return { confirm };
}
