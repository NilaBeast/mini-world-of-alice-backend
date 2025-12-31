exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // support multiple admin styles
  if (
    req.user.role?.toLowerCase() !== "admin" &&
    req.user.isAdmin !== true
  ) {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
};
