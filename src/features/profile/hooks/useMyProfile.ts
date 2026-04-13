import { useQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { IMemberProfile } from '@app-types/member';

export function useMyProfile() {
  return useQuery<IMemberProfile>({
    queryFn: () => membersService.getMyProfile(),
    // Backend no disponible aun
    enabled: false,
    errorMessage: 'No se pudo cargar el perfil',
  });
}
