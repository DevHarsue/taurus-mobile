// Allows TypeScript to accept global atob/btoa injected in polyfills.
export {};

declare global {
  // eslint-disable-next-line no-var
  var atob: ((data: string) => string) | undefined;
  // eslint-disable-next-line no-var
  var btoa: ((data: string) => string) | undefined;
}