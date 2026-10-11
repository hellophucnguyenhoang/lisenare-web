/**
 * Masks an email address to protect user privacy.
 * Example: "john.doe@gmail.com" -> "j***e@gmail.com"
 * Example: "me@example.com" -> "m*@example.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";

  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email;

  const maskPart = (part: string) =>
    part.length <= 1 ? `${part}**` : `${part[0]}*${part[part.length - 1]}`;

  const [local, domain] = [email.slice(0, atIndex), email.slice(atIndex + 1)];

  return `${maskPart(local)}@${domain.split(".").map(maskPart).join(".")}`;
}
