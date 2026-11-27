// Any /api request that no route matched ends here: same error shape as everywhere else.
function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

module.exports = notFound;
