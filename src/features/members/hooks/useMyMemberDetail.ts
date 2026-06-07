import { useQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { MemberDetail } from '@app-types/member';

export function useMyMemberDetail() {
    return useQuery<MemberDetail>({
        queryFn: () => membersService.getMine(),
        deps: [],
        errorMessage: 'No se pudo cargar tu perfil',
        cacheKey: 'member:me',
    });
}
