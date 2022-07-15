export function respondWithError(res, reason, details = undefined) {
  console.error(reason);
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify({ status: "error", reason, details }));
}