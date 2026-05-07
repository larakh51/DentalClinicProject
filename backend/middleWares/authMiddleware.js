const protect = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  req.user = req.session.user;

  next();
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  allowRoles,
};
