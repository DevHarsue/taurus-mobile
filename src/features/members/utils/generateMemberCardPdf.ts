import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'qrcode';
import type { MemberDetail } from '@app-types/member';
import { buildMemberCardHtml } from './buildMemberCardHtml';
import { buildMemberQrPayload } from './memberQr';

function printHtmlOnWeb(html: string): void {
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) {
        throw new Error(
            'El navegador bloqueó la ventana de impresión. Permite popups para este sitio e inténtalo de nuevo.',
        );
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    const trigger = () => {
        try {
            printWindow.focus();
            printWindow.print();
        } catch {
            // ignored
        }
    };

    if (printWindow.document.readyState === 'complete') {
        setTimeout(trigger, 250);
    } else {
        printWindow.addEventListener('load', () => setTimeout(trigger, 250));
        setTimeout(trigger, 1500);
    }
}

export async function generateMemberCardPdf(
    member: MemberDetail,
): Promise<void> {
    try {
        // eslint-disable-next-line no-console
        console.log('[CARNET] start for', member.name, 'platform=', Platform.OS);
        const qrPayload = buildMemberQrPayload(member.id);
        const qrSvg = await QRCode.toString(qrPayload, {
            type: 'svg',
            margin: 1,
            errorCorrectionLevel: 'M',
        });
        const qrDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`;
        // eslint-disable-next-line no-console
        console.log('[CARNET] qr generated, length=', qrDataUrl.length);

        const html = buildMemberCardHtml(member, qrDataUrl);
        // eslint-disable-next-line no-console
        console.log('[CARNET] html built, length=', html.length);

        if (Platform.OS === 'web') {
            printHtmlOnWeb(html);
            return;
        }

        // eslint-disable-next-line no-console
        console.log('[CARNET] calling Print.printToFileAsync...');
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        // eslint-disable-next-line no-console
        console.log('[CARNET] pdf generated at', uri);

        const isAvailable = await Sharing.isAvailableAsync();
        // eslint-disable-next-line no-console
        console.log('[CARNET] Sharing.isAvailable=', isAvailable);
        if (!isAvailable) {
            throw new Error(
                'No se puede compartir el carnet en este dispositivo.',
            );
        }

        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            UTI: 'com.adobe.pdf',
            dialogTitle: `Carnet · ${member.name}`,
        });
        // eslint-disable-next-line no-console
        console.log('[CARNET] shareAsync completed');
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[CARNET] FAILED:', e);
        throw e;
    }
}
