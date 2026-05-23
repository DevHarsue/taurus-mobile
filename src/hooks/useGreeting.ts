import { useAuth } from '@hooks/useAuth';
import { useQuery } from '@hooks/useQuery';
import { membersService } from '@api/services';
import type { MemberDetail } from '@app-types/member';

export function useGreeting() {
  const { user, isAdmin } = useAuth();

  const { data: myMember } = useQuery<MemberDetail>({
    queryFn: () => membersService.getMine(),
    deps: [],
    errorMessage: 'No se pudo cargar tu perfil',
    enabled: !isAdmin,
  });

  const emailName = user?.email?.split('@')[0] ?? 'Usuario';
  const displayName = !isAdmin && myMember?.name ? myMember.name : emailName;

  return { displayName, avatarName: displayName };
}
