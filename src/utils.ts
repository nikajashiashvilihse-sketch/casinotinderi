/**
 * Safe LocalStorage utility wrapper to avoid fatal crashes in sandboxed iframes
 * or strict privacy environments where localStorage accesses are restricted.
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== "undefined" && window.localStorage
        ? localStorage.getItem(key)
        : null;
    } catch (e) {
      console.warn(`[SafeStorage] Access denied reading key "${key}":`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Access denied writing key "${key}":`, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Access denied removing key "${key}":`, e);
    }
  }
};
