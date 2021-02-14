const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

require("dotenv").config();

// /api/auth/signup
router.post(
  "/signup",
  [
    check("email", "Wrong email").isEmail(),
    check("password", "Minimal length of password is 6 letters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Wrong data for register",
        });
      }

      let { email, password } = req.body;

      const candidate = await User.findOne({ email });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      password = await bcrypt.hash(password, 12);
      const user = new User({ email, password });

      user
        .save()
        .then(() => {
          res.status(200).json({ message: "User sucessfully created" });
        })
        .catch(() => {
          res.status(400).json({ message: "Something went wrong" });
        });
    } catch (e) {
      return res.status(400).json({ message: "Something went wrong" });
    }
  }
);

// /api/auth/signin
router.post(
  "/signin",
  [
    check("email", "Email is not correct").normalizeEmail().isEmail(),
    check("password", "Enter password").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Wrong data for login",
        });
      }

      let { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ message: "User with this email not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.jwtSecret, {
        expiresIn: "7d",
      });

      res.json({ token, userId: user.id });
    } catch (e) {
      return res.json({ message: "Something went wrong" });
    }
  }
);

module.exports = router;
