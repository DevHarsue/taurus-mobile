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
    const qrPayload = buildMemberQrPayload(member.id);
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 480,
        margin: 1,
        errorCorrectionLevel: 'M',
    });

    const html = buildMemberCardHtml(member, qrDataUrl);

    if (Platform.OS === 'web') {
        printHtmlOnWeb(html);
        return;
    }

    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const isAvailable = await Sharing.isAvailableAsync();
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
}
