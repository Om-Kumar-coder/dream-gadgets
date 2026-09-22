/**
 * MSG91 OTP Widget / SendOTP SDK loader.
 *
 * Loads https://verify.msg91.com/otp-provider.js (with the phone91 CDN as a
 * fallback) and exposes initSendOTP via a promise. This mirrors MSG91's
 * documented snippet but resolves through promises so React code can await it.
 */

declare global {
  interface Window {
    initSendOTP?: (config: Record<string, unknown>) => void;
  }
}

let initPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (window.initSendOTP) resolve();
      else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Load the widget SDK once and resolve when window.initSendOTP is available.
 * Rejects when neither CDN is reachable or initSendOTP never appears.
 */
export function loadOtpWidgetSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('OTP widget is browser-only'));
  }
  if (window.initSendOTP) return Promise.resolve();
  if (initPromise) return initPromise;

  const urls = ['https://verify.msg91.com/otp-provider.js', 'https://verify.phone91.com/otp-provider.js'];

  initPromise = (async () => {
    for (const url of urls) {
      try {
        await loadScript(url);
        if (typeof window.initSendOTP === 'function') return;
      } catch {
        // try the next CDN
      }
    }
    initPromise = null; // allow retry on a later attempt
    throw new Error('Could not load the OTP widget. Please check your connection and try again.');
  })();

  return initPromise;
}
