const express = require("express");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { requireLogin } = require("../middleware/auth");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { copyFile, mkdir } = require("fs/promises");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

//Register User
const secret = "test";

const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "uploads/");
  // },
  // filename: (req, file, cb) => {
  //   console.log(file);
  //   cb(null, Date.now() + path.extname(file.originalname));
  // },
});

const upload = multer({ storage: storage });

router.use("/photo", express.static("uploads"));

router.post("/register", async (req, res) => {
  const { name, email, password, college } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashed_password = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashed_password,
      college,
    });
    await user.save();

    return res.status(201).json({ message: "User created succesfully" });
  } catch (err) {
    console.log(err);
  }
});

//Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
  }
});

router.get("/", requireLogin, async (req, res) => {
  res.status(200).json(req.user);
});

router.post(
  "/photo",
  requireLogin,
  upload.single("photo"),
  async (req, res) => {
    console.log("File is: ", req.file);

    // TODO: Convert into appropriate dimensions (save a thumbnail)

    if (req.file.size > 2 * 1024 * 1024) {
      res.status(400).json({ error: "max file size of 2MB exceeded" });
      return;
    }

    let ext;
    switch (req.file.mimetype) {
      case "image/jpeg":
        ext = "jpg";
        break;
      case "image/png":
        ext = "png";
        break;
      default:
        res.status(400).json({ error: "bad content type" });
        return;
    }

    const name = `${uuidv4()}.${ext}`;

    console.log(name);

    await mkdir("uploads", { recursive: true });
    await copyFile(req.file.path, `uploads/${name}`);

    req.user.photo = name;
    await req.user.save();

    console.log(req.user);

    res.status(200).json({ photo: name });
  }
);

router.put("/", requireLogin, async (req, res) => {
  // TODO: Validate the data
  const {
    snapchat,
    instagram,
    name,
    phoneNumber,
    major,
    interests,
    email,
    password,
  } = req.body;
  const user = req.user;
  // const hashed_password = await bcrypt.hash(password, 10);
  user.email = email;
  user.name = name;
  user.phoneNumber = phoneNumber;
  user.major = major;
  // user.photo = photo;
  user.interests = interests;
  user.instagram = instagram;
  user.snapchat = snapchat;
  await user.save();
  res.status(200).json(req.user);
});

//verify-password
router.post("/verify-password", async (req, res) => {
  const { password, email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect Password" });
    }

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
  }
});

//delete user
router.delete("/", requireLogin, async (req, res) => {
  const _id = req.user._id;
  // console.log(req.user);
  // console.log(_id);
  const result = await User.deleteOne({ _id: _id });
  console.log(result);
  res.send("Account deactivated succesfully!");
});

router.post("/forgot-password", async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ error: "No user found" });
  }
  //2generate token

  const resetToken = user.createPasswordResetToken();
  await user.save({ requireLogin: false });

  //3 send as email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/auth/reset-password/${resetToken}`;

  // const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\n If you did not forget your password please ignore this`;

  const message = `To reset your password please use this One time password (OTP) \n
  ${resetToken} \n
  Do not share this OTP with anyone. Kweeble takes your account security very seriously. Kweeble Customer Service will never ask you to disclose or verify your Kweeble password, OTP, or credit card. If you receive a suspicious email with the link to update your account information, do not click on the link--instead, report the email to Kweeble for investigation. We hope to see you again soon!

  Thanks for using Kweeble!

  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ requireLogin: false });
    return res.status(500).json({ error: "Email was unable to send" });
  }
});

router.patch("/reset-password/:token", async (req, res) => {
  //1Get user based on the token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // const hashedToken = bcrypt.hash(req.params.token, 256);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2 if token has not expired, and there is a user, set the new password
  if (!user) {
    return res.status(400).json({ error: "Token is invalid or has expired" });
  }

  user.password = await bcrypt.hash(req.body.password, 10);

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3 update changedpasswordAt property for the user

  //4 log the user in set jwt
  const token = jwt.sign({ _id: user._id }, secret, {
    expiresIn: "1h",
  });

  return res.status(200).json({ status: "success", token });
});

router.put("/update-password", requireLogin, async (req, res) => {
  //1 check user
  const user = await User.findById(req.user.id).select("+password");
  //2 check is posted current password is correct
  const hashed_password = await bcrypt.hash(req.body.password, 10);
  //3if so, update password
  user.password = hashed_password;
  await user.save();

  res.status(200).json(req.user);

  //4 log user in, send jwt
});

module.exports = router;
