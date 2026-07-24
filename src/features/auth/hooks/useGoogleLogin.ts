import { useState } from 'react';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useAuth } from '@hooks/useAuth';

// SDK nativo de Google Sign-In (no navegador, no flujo implícito → evita el
// "Error 400: invalid_request / response_type=token" de expo-auth-session).
//
// En Android, Google identifica la app por package + SHA-1 (el OAuth client de
// Android creado en la consola), no por un client ID en el código. Pedimos el
// access_token y lo mandamos al backend, que lo valida vía /userinfo: así es
// independiente del proyecto y del audience del id_token.
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    scopes: ['profile', 'email'],
  });
}

export function useGoogleLogin() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    // El SDK nativo no aplica en web: Google Sign-In es solo móvil.
    if (Platform.OS === 'web') {
      setError(
        'El inicio de sesión con Google está disponible solo en la app móvil (Android/iOS).',
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { accessToken } = await GoogleSignin.getTokens();
        if (!accessToken) {
          throw new Error('Google no devolvió access_token');
        }
        await loginWithGoogle({ accessToken });
      }
      // response.type === 'cancelled' → el usuario cerró el diálogo: sin error.
    } catch (e) {
      if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) {
        // Ya hay un inicio de sesión en curso: ignorar.
      } else {
        setError('No se pudo iniciar sesión con Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}
