const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * JWT Authorization Middleware
 *
 * Expects a Bearer token in the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success, attaches the decoded payload to req.user and calls next().
 * On failure, responds with 401 (missing/malformed) or 403 (invalid/expired).
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Check header presence and format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided or malformed Authorization header.",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Distinguish between expired and other invalid tokens
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token has expired. Please log in again." });
      }
      return res.status(403).json({ message: "Invalid token. Access forbidden." });
    }

    // Attach decoded payload (e.g. { _id, name }) to request for downstream use
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
