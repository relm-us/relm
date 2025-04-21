import { config } from "../config.js"

//
// respondWith* - Respond with JSON content with information.
//

export function respondWithError(res, reason, details = undefined) {
  console.error(reason, JSON.stringify(details))

  res.writeHead(200, config.CONTENT_TYPE_JSON)
  res.end(generateErrorMessage(reason, details))
}

export function respondWithSuccess(res, json) {
  res.writeHead(200, config.CONTENT_TYPE_JSON)
  res.end(generateSuccessMessage(json))
}

// This should only be called by error handlers
export function respondWithFailure(res, reason, details = undefined) {
  res.writeHead(200, config.CONTENT_TYPE_JSON)
  res.end(generateFailureMessage(reason, details))
}

//
// respondWith*PostMessage - Respond with a postMessage() function in the content returned.
// Useful for sending data from a popup back to the main tab.
//

export function respondWithErrorPostMessage(res, reason, details = undefined) {
  console.error(reason)
  res.end(generatePostMessageScript(generateErrorMessage(reason, details)))
}

export function respondWithSuccessPostMessage(res, json) {
  res.end(generatePostMessageScript(generateSuccessMessage(json)))
}

export function respondWithFailurePostMessage(res, reason, details = undefined) {
  res.end(generatePostMessageScript(generateFailureMessage(reason, details)))
}

// Utility functions

function generateErrorMessage(reason, details = undefined) {
  return JSON.stringify({ status: "error", reason, details })
}

function generateSuccessMessage(json) {
  return JSON.stringify({ status: "success", ...json })
}

function generateFailureMessage(reason, details = undefined) {
  return JSON.stringify({ status: "failure", reason, details })
}

function generatePostMessageScript(str) {
  // Prevent any XSS attacks (in case!) by encoding to base64.
  const base64 = Buffer.from(str).toString("base64")
  return `<script>
    window.opener.postMessage("${base64}", "*");
  </script>`
}
