const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.requireLogin = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      const payload = jwt.verify(token, process.env.SECRET); // TODO: replace secret with the actual secret
      const user = await User.findById(payload._id);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(404).json({ message: "user doesn't exist" });
      }
    } else {
      res.status(400).json({ message: "unauthorized" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
