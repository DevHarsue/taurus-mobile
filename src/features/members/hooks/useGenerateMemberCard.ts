import { useMutation } from '@hooks/useMutation';
import type { MemberDetail } from '@app-types/member';
import { generateMemberCardPdf } from '../utils/generateMemberCardPdf';

export function useGenerateMemberCard() {
    return useMutation<MemberDetail, void>({
        mutationFn: (member) => generateMemberCardPdf(member),
        errorMessage: 'No se pudo generar el carnet',
    });
}
