import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth } from '@hooks/useAuth';
import { useMutation } from '@hooks/useMutation';
import type { GoogleLoginRequest } from '@app-types/auth';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({
  scheme: 'taurus-mobile',
});

export function useGoogleLogin() {
  const { loginWithGoogle } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '181757025086-1e46pautjh8gc3k2c6o0ojaen49tjfhj.apps.googleusercontent.com',
    redirectUri,
  });

  const mutation = useMutation<GoogleLoginRequest>({
    mutationFn: (body) => loginWithGoogle(body),
    errorMessage: 'No se pudo iniciar sesión con Google',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // Intentar obtener id_token (flujo móvil), sino usar access_token (flujo web)
      const idToken = response.params?.id_token || response.authentication?.idToken;
      const accessToken = response.params?.access_token || response.authentication?.accessToken;

      if (idToken) {
        mutation.mutate({ idToken });
      } else if (accessToken) {
        mutation.mutate({ accessToken });
      }
    }
  }, [response]);

  return {
    signIn: () => promptAsync(),
    loading: !request || mutation.loading,
    error: mutation.error,
  };
}
