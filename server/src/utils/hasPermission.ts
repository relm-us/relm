import { isAllowed } from "./isAllowed.js";

/**
 *
 * @param requestedPermission The kind of permission desired
 * @param permissions An object with relm as key and array of permits as value
 * @param relm Either the relmId, or the relmName, depending on how `permissions` was returned
 * @returns
 */
export function hasPermission(
  requestedPermission: "access" | "edit" | "invite" | "admin",
  permissions,
  relm: string
) {
  if ("*" in permissions && relm in permissions) {
    return (
      isAllowed(permissions["*"], requestedPermission) ||
      isAllowed(permissions[relm], requestedPermission)
    );
  } else if (relm in permissions) {
    return isAllowed(permissions[relm], requestedPermission);
  } else if ("*" in permissions) {
    return isAllowed(permissions["*"], requestedPermission);
  } else {
    return false;
  }
}
