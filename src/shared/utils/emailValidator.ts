/**
 * Email validation utility with common domain checking
 */

const commonDomains = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "aol.com",
  "proton.me",
  "zoho.com",
  "me.com",
  "gmx.com",
  "yandex.com",
  "ups.com.eg"
];

/**
 * Validates an email address format and domain
 * @param email - The email address to validate
 * @returns true if the email is valid and from a common domain, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim whitespace
  email = email.trim();

  // Check for spaces
  if (email.includes(' ')) {
    return false;
  }

  // Basic email format validation
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Extract domain from email
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return false;
  }

  // Check if domain is in the common domains list
  return commonDomains.includes(domain);
}

/**
 * Gets a list of all supported email domains
 * @returns Array of common email domains
 */
export function getSupportedDomains(): string[] {
  return [...commonDomains];
}

/**
 * Validates email and returns specific error message key
 * @param email - The email address to validate
 * @returns null if valid, or error message key if invalid
 */
export function getEmailValidationError(email: string): string | null {
  if (!email) {
    return 'validation.emailRequired';
  }

  if (email.startsWith(' ') || email.endsWith(' ')) {
    return 'validation.emailTrimmed';
  }

  if (email.includes(' ')) {
    return 'validation.emailNoSpaces';
  }

  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return 'validation.emailInvalid';
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !commonDomains.includes(domain)) {
    return 'validation.emailDomainNotSupported';
  }

  return null;
}
