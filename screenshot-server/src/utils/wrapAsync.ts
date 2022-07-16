// We use wrapAsync so that async errors get caught and handled by our generic error handler
export function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}
