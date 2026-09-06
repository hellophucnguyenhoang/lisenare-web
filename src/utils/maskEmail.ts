/**
 * Masks an email address to protect user privacy.
 * Example: "john.doe@gmail.com" -> "j***e@gmail.com"
 * Example: "me@example.com" -> "m*@example.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email;

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex); // includes "@"

  if (localPart.length <= 1) {
    return `${localPart}*${domain}`;
  }
  if (localPart.length === 2) {
    return `${localPart[0]}*${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const stars = "*".repeat(3);

  return `${firstChar}${stars}${lastChar}${domain}`;
}
