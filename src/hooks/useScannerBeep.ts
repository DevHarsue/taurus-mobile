import { useCallback } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Beep corto para el escaner de QR (Fase 6).
 *
 * Usa `expo-audio` (vigente en Expo SDK 55; `expo-av` esta deprecado).
 * Respeta el modo silencio del telefono por defecto. Se combina con
 * `haptics.success()` en QRScannerScreen para feedback dual (sonido + vibracion).
 *
 * El player se crea de forma perezosa una sola vez y se reutiliza; en web,
 * donde la creacion del player puede fallar, se degrada silenciosamente.
 */
let player: AudioPlayer | null = null;
let initialized = false;

function ensurePlayer(): AudioPlayer | null {
  if (initialized) return player;
  initialized = true;
  try {
    // No interrumpir audio de fondo; respetar el switch de silencio.
    void setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
    player = createAudioPlayer(require('../assets/sounds/beep.wav'));
  } catch {
    player = null;
  }
  return player;
}

export function useScannerBeep() {
  const playBeep = useCallback(() => {
    try {
      const p = ensurePlayer();
      if (!p) return;
      p.seekTo(0);
      p.play();
    } catch {
      // Silencioso: el sonido es un extra, nunca debe romper el escaneo.
    }
  }, []);

  return { playBeep };
}
