import { useCallback, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { navigationRef } from '@navigation/navigationRef';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';

/**
 * Deep linking de Taurus (Fase 6). Scheme: `gymtaurus://`.
 *
 * Rutas soportadas:
 *   - gymtaurus://member/{id}      → MemberDetail del miembro (solo admin).
 *   - gymtaurus://renew/{memberId} → RenewMembership del miembro (solo admin).
 *   - gymtaurus://verify/{memberId}→ si admin logueado: MemberDetail; si no,
 *                                    se abre login y se navega tras autenticar.
 *
 * Comportamiento esperado (probado mentalmente):
 *   - Usuario NO logueado: se guarda la URL como pendiente (`pendingRef`) y,
 *     como el `RootNavigator` ya muestra el stack de auth, el usuario ve el
 *     login. Tras un login exitoso (isAuthenticated → true) se consume la URL
 *     pendiente y se navega al destino.
 *   - memberId inexistente: la navegacion ocurre igual; la pantalla destino
 *     (MemberDetail/RenewMembership) maneja el error via `useMemberDetail`
 *     mostrando un `ErrorState` con reintento. No se cae la app.
 *   - App abierta en otra pantalla cuando llega el link: `navigationRef`
 *     navega directamente al destino (cold start via `getInitialURL`,
 *     warm via el listener `url`).
 *   - Usuario logueado como `member` (no admin) abriendo un link de admin: se
 *     ignora la navegacion y se muestra un toast de "no autorizado".
 *
 * El arbol de navegacion es auth-gated y condicional (AdminTabs / MemberShell /
 * AuthStack segun estado), por eso usamos un manejador manual en vez del prop
 * `linking` declarativo de React Navigation.
 */

type DeepLinkTarget = { action: 'member' | 'renew' | 'verify'; id: string };

function parseDeepLink(url: string): DeepLinkTarget | null {
  // Quitar el scheme (gymtaurus:// o taurus-mobile://) y el query string.
  const withoutScheme = url.replace(/^[a-zA-Z][\w+.-]*:\/\//, '');
  const [pathPart] = withoutScheme.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  if (segments.length < 2) return null;
  const [action, id] = segments;
  if (!id) return null;
  if (action === 'member' || action === 'renew' || action === 'verify') {
    return { action, id };
  }
  return null;
}

function navigateToTarget(target: DeepLinkTarget) {
  if (!navigationRef.isReady()) return;
  const nav = navigationRef.navigate as (name: string, params?: object) => void;
  if (target.action === 'renew') {
    nav('Members', { screen: 'RenewMembership', params: { memberId: target.id } });
  } else {
    // 'member' y 'verify' abren el detalle del miembro.
    nav('Members', { screen: 'MemberDetail', params: { id: target.id } });
  }
}

export function useDeepLinks() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const pendingRef = useRef<string | null>(null);

  const handleUrl = useCallback(
    (url: string | null) => {
      if (!url) return;
      const target = parseDeepLink(url);
      if (!target) return;

      if (!isAuthenticated) {
        // Guardar para consumir tras el login.
        pendingRef.current = url;
        return;
      }
      if (!isAdmin) {
        toast.warning('No tienes permiso para abrir ese enlace');
        return;
      }
      // Dar un tick para que el navigator destino este montado.
      setTimeout(() => navigateToTarget(target), 50);
    },
    [isAuthenticated, isAdmin, toast],
  );

  // Cold start + listener de URLs entrantes.
  useEffect(() => {
    let mounted = true;
    void Linking.getInitialURL().then((url) => {
      if (mounted) handleUrl(url);
    });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [handleUrl]);

  // Consumir el link pendiente cuando el usuario se autentica.
  useEffect(() => {
    if (isAuthenticated && pendingRef.current) {
      const url = pendingRef.current;
      pendingRef.current = null;
      // Esperar a que RootNavigator monte AdminTabs tras el cambio de auth.
      setTimeout(() => handleUrl(url), 350);
    }
  }, [isAuthenticated, handleUrl]);
}
