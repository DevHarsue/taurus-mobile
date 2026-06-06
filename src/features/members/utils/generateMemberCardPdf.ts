import QRCode from 'qrcode';
import type { MemberDetail } from '@app-types/member';
import { sharePdf } from '@utils/pdf';
import { buildMemberCardHtml } from './buildMemberCardHtml';
import { buildMemberQrPayload } from './memberQr';

export async function generateMemberCardPdf(
    member: MemberDetail,
): Promise<void> {
    const qrPayload = buildMemberQrPayload(member.id);
    const qrSvg = await QRCode.toString(qrPayload, {
        type: 'svg',
        margin: 1,
        errorCorrectionLevel: 'M',
    });
    const qrDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`;

    const html = buildMemberCardHtml(member, qrDataUrl);

    await sharePdf(html, {
        fileName: `carnet_${member.id.slice(0, 8)}.pdf`,
        dialogTitle: `Carnet · ${member.name}`,
    });
}
