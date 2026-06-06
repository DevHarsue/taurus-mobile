import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface ISharePdfOptions {
  /**
   * Nombre sugerido del archivo. En iOS/Android el nombre final lo decide el
   * sistema operativo (printToFileAsync genera un nombre temporal); se
   * conserva para la ventana de impresion en web y como referencia.
   */
  fileName: string;
  /** Titulo del dialogo nativo de compartir. */
  dialogTitle: string;
}

/** Abre una ventana con el HTML y dispara el dialogo de impresion del navegador. */
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

/**
 * Genera un PDF a partir de HTML y lo comparte.
 *
 * - Web: abre el dialogo de impresion del navegador (el usuario "imprime a PDF").
 * - Nativo: genera el PDF con expo-print y abre la hoja de compartir del sistema.
 */
export async function sharePdf(
  html: string,
  options: ISharePdfOptions,
): Promise<void> {
  if (Platform.OS === 'web') {
    printHtmlOnWeb(html);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('No se puede compartir el PDF en este dispositivo.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: options.dialogTitle,
  });
}
