export function printStackTrace(maybeError: any) {
  if (maybeError instanceof Error) {
    // If it's a real Error object, use its stack property
    console.error(maybeError.stack || "No stack trace available.")
  }

  if (typeof maybeError === "object" && maybeError !== null && "stack" in maybeError) {
    // If it's an object with a stack property, attempt to print it
    console.error(maybeError.stack || "No stack trace available.")
  }

  // Fallback: Log the object itself for debugging
  console.error("Provided object is not an Error or lacks a stack trace:", maybeError)
}
