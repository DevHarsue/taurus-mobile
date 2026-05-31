// One-off generator for a short scanner beep (16-bit PCM mono WAV).
// Run: node scripts/gen-beep.js  → writes src/assets/sounds/beep.wav
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const duration = 0.13; // seconds
const freq = 880; // A5
const numSamples = Math.floor(sampleRate * duration);
const bytesPerSample = 2;

const dataSize = numSamples * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
// fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // PCM chunk size
buffer.writeUInt16LE(1, 20); // PCM format
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * bytesPerSample, 28); // byte rate
buffer.writeUInt16LE(bytesPerSample, 32); // block align
buffer.writeUInt16LE(16, 34); // bits per sample
// data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

const attack = Math.floor(numSamples * 0.05);
const release = Math.floor(numSamples * 0.25);
for (let i = 0; i < numSamples; i++) {
  // Amplitude envelope to avoid clicks.
  let env = 1;
  if (i < attack) env = i / attack;
  else if (i > numSamples - release) env = (numSamples - i) / release;
  const sample = Math.sin((2 * Math.PI * freq * i) / sampleRate) * env * 0.6;
  buffer.writeInt16LE(Math.max(-1, Math.min(1, sample)) * 32767, 44 + i * 2);
}

const outDir = path.join(__dirname, '..', 'src', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'beep.wav');
fs.writeFileSync(outPath, buffer);
console.log('Wrote', outPath, buffer.length, 'bytes');
