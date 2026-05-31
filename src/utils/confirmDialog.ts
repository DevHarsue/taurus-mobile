import { Alert, Platform } from 'react-native';

/**
 * Dialogo de confirmacion cross-platform (iOS, Android, Web).
 *
 * Reemplaza el patron disperso `Platform.OS === 'web' ? window.confirm(...) :
 * require('react-native').Alert.alert(...)` por una unica API que devuelve
 * Promise<boolean>:
 *
 *   if (await confirmDialog('Eliminar plan', '¿Seguro?')) { ... }
 *
 * - Web: usa `window.confirm` (Alert.alert de RN Web solo soporta 1 boton).
 * - Native: usa `Alert.alert` con botones Cancelar / Confirmar.
 */
export function confirmDialog(
  title: string,
  message?: string,
  options?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean },
): Promise<boolean> {
  const confirmLabel = options?.confirmLabel ?? 'Confirmar';
  const cancelLabel = options?.cancelLabel ?? 'Cancelar';

  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    // eslint-disable-next-line no-alert
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: options?.destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
