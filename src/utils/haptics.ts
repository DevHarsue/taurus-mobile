import * as Haptics from 'expo-haptics';

/**
 * Feedback haptico centralizado (Fase 6).
 *
 * En web (y en cualquier plataforma sin motor haptico) expo-haptics resuelve
 * silenciosamente; el `.catch` evita unhandled rejections. NO se agrega logica
 * condicional por plataforma a proposito.
 */
const run = (p: Promise<void>) => {
  void p.catch(() => {});
};

export const haptics = {
  success: () =>
    run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () =>
    run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () =>
    run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  light: () => run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
};
