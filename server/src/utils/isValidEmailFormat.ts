const emailPattern = /^[^@]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// Checks if the format of the email appears correct.
export const isValidEmailFormat = (email: string) =>
  email && Boolean(emailPattern.test(email));
