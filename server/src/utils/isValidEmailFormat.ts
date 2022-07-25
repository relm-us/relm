// Checks if the format of the email appears correct.
export function isValidEmailFormat(email: string) {
  if (!email) {
    return null;
  }
  
  const emailAtSplitIndex = email.lastIndexOf("@");
  
  // Split it into userPart @ domainPart.com
  const userPart = email.substring(0, emailAtSplitIndex);
  const domainPart = email.substring(emailAtSplitIndex + 1);

  const userPartIsValid = userPart.length > 0;
  const domainPartIsValid = domainPart.includes(".") && domainPart.length >= 3;

  return userPartIsValid && domainPartIsValid;
}