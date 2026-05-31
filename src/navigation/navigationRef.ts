import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Ref global al NavigationContainer (Fase 6).
 *
 * Permite navegar fuera del arbol de componentes de React Navigation —en
 * concreto desde el manejador de deep links (`useDeepLinks`)— sin necesidad de
 * `useNavigation`. Se asigna en `<NavigationContainer ref={navigationRef}>`.
 */
export const navigationRef = createNavigationContainerRef();
