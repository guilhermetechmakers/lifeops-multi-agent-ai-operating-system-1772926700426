/**
 * Password strength calculation for profile security UI.
 * Returns level 0–4 and label for accessibility.
 */

export interface PasswordStrength {
  level: number;
  label: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return { level: 0, label: "Enter a password" };
  }
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  const level = Math.min(4, score);
  const labels: string[] = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  return { level, label: labels[level] ?? "Unknown" };
}
