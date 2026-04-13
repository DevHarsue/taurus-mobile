import { decode as atob, encode as btoa } from 'base-64';

// Polyfills for libraries / utilities that expect atob/btoa.
if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = atob;
}

if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = btoa;
}