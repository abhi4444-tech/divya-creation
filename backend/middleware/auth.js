
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.dc_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please log in first",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const id = Number(decoded.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    req.user = { id };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please log in again.",
    });
  }
}

module.exports = { requireAuth };
