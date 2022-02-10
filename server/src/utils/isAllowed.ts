/**
 * A venn diagram of what is allowed:
 *
 *     /-----------------------\
 *     |         admin         |
 *     | /----------\ /------\ |
 *     | |   edit   | |invite| |
 *     | | /------\ | \------/ |
 *     | | |access| |          |
 *     | | \------/ |          |
 *     | \----------/          |
 *     \-----------------------/
 */
export function isAllowed(permits, requestedPermission) {
  switch (requestedPermission) {
    case "access":
      return (
        permits.includes("access") ||
        permits.includes("edit") ||
        permits.includes("admin")
      );
    case "edit":
      return permits.includes("edit") || permits.includes("admin");
    case "invite":
      return permits.includes("invite") || permits.includes("admin");

    case "admin":
      return permits.includes("admin");
    default:
      return false;
  }
}
