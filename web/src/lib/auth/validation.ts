// Shared by the auth forms (browser) and the server actions, so both give the same messages.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

export function emailError(email: string) {
  if (!email) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "That email doesn't look right.";
  return undefined;
}

export function displayNameError(name: string) {
  if (!name) return "Choose a display name.";
  if (name.length < 3) return "Use at least 3 characters.";
  if (name.length > 24) return "Use 24 characters or fewer.";
  return undefined;
}

export function newPasswordError(password: string) {
  return password.length < MIN_PASSWORD ? `Use at least ${MIN_PASSWORD} characters.` : undefined;
}

/** Only same-site paths, so a `?next=` link can't send someone to another website after logging in. */
export function safeNext(value: unknown, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
