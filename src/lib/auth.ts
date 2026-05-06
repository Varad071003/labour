export type Role = "worker" | "employer";
export type Session = { phone: string; role: Role; loggedInAt: number };

const SESSION_KEY = "wl_session_v1";
const OTP_KEY = "wl_otp_v1";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setSession(s: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Demo OTP — generates a 6-digit code and stores it locally.
 *  Replace with real SMS gateway (Twilio + Lovable Cloud) for production. */
export function sendOtp(phone: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  localStorage.setItem(OTP_KEY, JSON.stringify({ phone, code, ts: Date.now() }));
  return code;
}

export function verifyOtp(phone: string, code: string): boolean {
  const raw = localStorage.getItem(OTP_KEY);
  if (!raw) return false;
  try {
    const v = JSON.parse(raw);
    return v.phone === phone && v.code === code && Date.now() - v.ts < 10 * 60 * 1000;
  } catch { return false; }
}

export function clearOtp() {
  localStorage.removeItem(OTP_KEY);
}
