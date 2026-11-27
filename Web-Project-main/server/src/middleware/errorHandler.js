// Centralized error handling (Weeks 8 and 9).
// Four parameters tell Express this is an error handler. next(err) in any route jumps here.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Body was not valid JSON (thrown by express.json())
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON body" });
  }

  // A schema rule failed: required, enum, minlength, ...
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  // e.g. /something/abc where abc is not a valid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid id" });
  }

  // A unique field is already used
  if (err.code === 11000) {
    return res.status(409).json({ error: "Already exists" });
  }

  const status = err.status || 500;

  // Log real server bugs for us; show a clean message to the client.
  if (status >= 500) {
    console.error(err);
    return res.status(status).json({ error: "Server error" });
  }

  res.status(status).json({ error: err.message });
}

module.exports = errorHandler;
