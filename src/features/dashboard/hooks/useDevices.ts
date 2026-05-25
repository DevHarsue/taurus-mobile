import { useQuery } from '@hooks/useQuery';
import { useMutation } from '@hooks/useMutation';
import { devicesService } from '@api/services';
import type { IDevice, CreateDeviceRequest } from '@app-types/device';

export function useDevices() {
  return useQuery<IDevice[]>({
    queryFn: () => devicesService.getAll(),
    errorMessage: 'No se pudo cargar la lista de dispositivos',
  });
}

export function useCreateDevice(onSuccess?: () => void) {
  return useMutation<CreateDeviceRequest, IDevice>({
    mutationFn: (data) => devicesService.create(data),
    errorMessage: 'No se pudo registrar el dispositivo',
    onSuccess: () => onSuccess?.(),
  });
}

export function useDeleteDevice(onSuccess?: () => void) {
  return useMutation<string, void>({
    mutationFn: (id) => devicesService.remove(id),
    errorMessage: 'No se pudo eliminar el dispositivo',
    onSuccess: () => onSuccess?.(),
  });
}
