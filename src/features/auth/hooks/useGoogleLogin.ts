import { useEffect } from 'react';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '@hooks/useAuth';
import { useMutation } from '@hooks/useMutation';
import type { GoogleLoginRequest } from '@app-types/auth';

WebBrowser.maybeCompleteAuthSession();

// Client IDs de Google (configurados en app.json -> extra).
// IMPORTANTE: Google bloquea el flujo nativo con un client ID de tipo "Web"
// (Error 400: invalid_request). En Android/iOS hay que usar client IDs
// NATIVOS y correr un dev build (Expo Go ya no soporta Google en SDK 55+).
const extra = (Constants.expoConfig?.extra ?? {}) as {
  googleWebClientId?: string;
  googleAndroidClientId?: string;
  googleIosClientId?: string;
};

export function useGoogleLogin() {
  const { loginWithGoogle } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: extra.googleWebClientId,
    androidClientId: extra.googleAndroidClientId || undefined,
    iosClientId: extra.googleIosClientId || undefined,
  });

  // En desarrollo: muestra la redirect URI real que genera el proveedor,
  // util para registrarla en Google Cloud Console si hiciera falta.
  useEffect(() => {
    if (__DEV__ && request?.redirectUri) {
      console.log('[GoogleLogin] redirectUri =', request.redirectUri);
    }
  }, [request?.redirectUri]);

  const mutation = useMutation<GoogleLoginRequest>({
    mutationFn: (body) => loginWithGoogle(body),
    errorMessage: 'No se pudo iniciar sesión con Google',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken =
        response.params?.id_token || response.authentication?.idToken;
      const accessToken =
        response.authentication?.accessToken || response.params?.access_token;

      // Preferimos access_token: el backend lo valida vía /userinfo, lo que
      // NO depende del client ID ni del proyecto (con client nativo de Android
      // el id_token trae aud = androidClientId y el backend lo rechazaría).
      if (accessToken) {
        mutation.mutate({ accessToken });
      } else if (idToken) {
        mutation.mutate({ idToken });
      }
    }
  }, [response]);

  return {
    signIn: () => promptAsync(),
    loading: !request || mutation.loading,
    error: mutation.error,
  };
}
