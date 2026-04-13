export type LogoutHandler = () => void | Promise<void>;

let logoutHandler: LogoutHandler | null = null;

export function setLogoutHandler(handler: LogoutHandler | null) {
  logoutHandler = handler;
}

export async function triggerLogout() {
  await logoutHandler?.();
}