function isObject(val) {
  return val != null && typeof val === "object" && Array.isArray(val) === false;
}

function isObjectObject(o) {
  return (
    isObject(o) === true &&
    Object.prototype.toString.call(o) === "[object Object]"
  );
}

export function isPlainObject(o) {
  var ctor, prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== "function") return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}
