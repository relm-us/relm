// Checks if a password is valid for registration.
export function isValidPasswordFormat(password: string) {
  if (!password) {
    return false;
  }

  return password.length >= 8;
}