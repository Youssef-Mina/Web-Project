// Same shape as every middleware: (req, res, next). Week 8.
// Logs when the response finishes, so we can show the status code and time taken.
function logger(req, res, next) {
  const started = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - started;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  next(); // hand off to the next one — forget this and the request hangs
}

module.exports = logger;
