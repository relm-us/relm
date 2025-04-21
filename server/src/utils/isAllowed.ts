import type { Permission } from "../db/permission.js"

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
 *
 * NOTE: `read` permission is situated inside `access` (not shown)
 *
 */
export function isAllowed(permits: Array<Permission>, requestedPermission: Permission) {
  // biome-ignore format: tidier
  switch (requestedPermission) {
    case "read":
      return (
        permits.includes("read") ||
        permits.includes("access") ||
        permits.includes("edit") ||
        permits.includes("admin")
      );
    case "access":
      return (
        permits.includes("access") ||
        permits.includes("edit") ||
        permits.includes("admin")
      );
    case "edit":
      return (
        permits.includes("edit") ||
        permits.includes("admin")
      );
    case "invite":
      return (
        permits.includes("invite") ||
        permits.includes("admin")
      );

    case "admin":
      return permits.includes("admin");
    default:
      return false;
  }
}
