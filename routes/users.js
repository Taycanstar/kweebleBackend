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
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const sendEmail = require("../utils/email");
const Course = require("../models/Course");
const Item = require("../models/Item");
const Confirmation = require("../models/Confirmation");
const Event = require("../models/Grade");
const { getMessaging } = require("firebase-admin/messaging");

const secret = "test";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    public_id: (req, file) => Date.now(),
  },
});

const upload = multer({ storage: storage });

router.use("/photo", express.static("uploads"));

//Register User
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    college,
    savedEvents,
    savedProducts,
    birthDay,
    birthMonth,
    birthYear,
    blockedUsers,
    username,
    followers,
    following,
    registrationTokens,
  } = req.body;
  try {
    let user =
      (await User.findOne({ email })) || (await User.findOne({ username }));
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashed_password = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashed_password,
      college,
      username,
      savedEvents,
      savedProducts,
      birthYear,
      birthMonth,
      birthDay,
      blockedUsers,
      followers,
      following,
      registrationTokens,
      evaConversationHistory: [],
    });
    await user.save();

    return res.status(201).json({ message: "User created succesfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
});

//Login userr
router.post("/login", async (req, res) => {
  // Pass the current registrationToken with the request
  const { email, password, username, registrationToken } = req.body;
  try {
    // let user = await User.findOne({ email });
    // (await User.findOne({ email: req.body.email.toLowerCase() })) ||
    //   (await User.findOne({ username: req.body.username.toLowerCase() }))
    let user =
      (await User.findOne({ email })) || (await User.findOne({ username }));
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    // const isMatch = await (password === user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    if (registrationToken) {
      // Check if the user profile already has this device registered
      if (
        !user.registrationTokens ||
        !user.registrationTokens.includes(registrationToken)
      ) {
        await User.findByIdAndUpdate(user._id, {
          registrationTokens: user.registrationTokens
            ? [...user.registrationTokens, registrationToken]
            : [registrationToken],
        });
      }
    }

    const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
  }
});

// router.post("/login", async (req, res) => {
//   const { email, password, username, registrationToken } = req.body;
//   try {
//     let user =
//       (await User.findOne({ email })) || (await User.findOne({ username }));

//     if (!user) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     if (registrationToken) {
//       if (
//         !user.registrationTokens ||
//         !user.registrationTokens.includes(registrationToken)
//       ) {
//         user = await User.findByIdAndUpdate(
//           user._id,
//           {
//             registrationTokens: user.registrationTokens
//               ? [...user.registrationTokens, registrationToken]
//               : [registrationToken],
//           },
//           { new: true } // This option makes findByIdAndUpdate return the updated document
//         );
//       }
//     }

//     const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
//       expiresIn: "1h",
//     });

//     for (const scopeId of user.scopes) {
//       for (const token of user.registrationTokens) {
//         await getMessaging()
//           .subscribeToTopic(token, scopeId)
//           .then((response) => {
//             console.log("Successfully subscribed to topic:", response);
//           })
//           .catch((error) => {
//             console.log("Error subscribing to topic:", error);
//           });
//       }
//     }

//     return res.status(200).json({ token });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

//Update
router.get("/", requireLogin, async (req, res) => {
  res.status(200).json(req.user);
});

router.post(
  "/photo",
  // requireLogin,
  upload.single("photo"),
  async (req, res) => {
    console.log("File is: ", req.file);

    // TODO: Convert into appropriate dimensions (save a thumbnail)

    // if (req.file.size > 2 * 1024 * 1024) {
    //   res.status(400).json({ error: "max file size of 2MB exceeded" });
    //   return;
    // }
    if (req.file.size > 2 * 3000 * 3000) {
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
    // console.log(req, "filebitch");
    // req.user.photo = req.file.path;
    // await req.user.save();

    // console.log(req.user);

    // res.status(200).json(req.user);
    res.status(200).json(req.file.path);
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
    typeOfDegree,
    btcAddress,
    ethAddress,
    dogeAddress,
    birthDay,
    birthMonth,
    birthYear,
    gradeLevel,
    position,
  } = req.body;
  const user = req.user;
  // const hashed_password = await bcrypt.hash(password, 10);
  user.email = email;
  user.name = name;
  user.phoneNumber = phoneNumber;
  user.major = major;
  user.typeOfDegree = typeOfDegree;
  user.birthDay = birthDay;
  user.birthMonth = birthMonth;
  user.birthYear = birthYear;
  // user.photo = photo;
  user.interests = interests;
  user.instagram = instagram;
  user.snapchat = snapchat;
  user.btcAddress = btcAddress;
  user.ethAddress = ethAddress;
  user.dogeAddress = dogeAddress;
  user.gradeLevel = gradeLevel;
  user.position = position;
  await user.save();
  res.status(200).json(req.user);
});

//Edir profile method 2
router.put("/user/:id", async (req, res) => {
  try {
    const {
      snapchat,
      instagram,
      name,
      phoneNumber,
      major,
      interests,
      gradeLevel,
      position,
      photo,
      id,
    } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, {
      snapchat,
      instagram,
      name,
      phoneNumber,
      major,
      interests,
      gradeLevel,
      position,
      photo,
      id,
    });

    // const scope = await Scope.updateOne(
    //   { _id: req.params.id },
    //   { photo: photo }

    console.log(user, "<= user");

    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

//Edit bd method 2
router.put("/userBd/:id", async (req, res) => {
  try {
    const { birthDay, birthMonth, birthYear, id } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, {
      birthDay,
      birthMonth,
      birthYear,
      id,
    });

    // const scope = await Scope.updateOne(
    //   { _id: req.params.id },
    //   { photo: photo }

    console.log(user, "<= user");

    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

//Edit email method 2
router.put("/email/:id", async (req, res) => {
  try {
    const { email, id } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, {
      email,
      id,
    });

    // const scope = await Scope.updateOne(
    //   { _id: req.params.id },
    //   { photo: photo }

    console.log(user, "<= user");

    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

//Edit email method 2
router.put("/email/:id", async (req, res) => {
  try {
    const { email, id } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, {
      email,
      id,
    });

    // const scope = await Scope.updateOne(
    //   { _id: req.params.id },
    //   { photo: photo }

    console.log(user, "<= user");

    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

// //verify-password
// router.post("/verify-password", async (req, res) => {
//   const { password, email } = req.body;
//   try {
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     // const isMatch = await (password === user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Incorrect Password" });
//     }

//     return res.status(200).json({ message: "success" });
//   } catch (error) {
//     console.log(error);
//   }
// });

// //delete user
// router.delete("/", requireLogin, async (req, res) => {
//   const _id = req.user._id;
//   // console.log(req.user);
//   // console.log(_id);
//   const result = await User.deleteOne({ _id: _id });
//   console.log(result);
//   res.send("Account deactivated succesfully!");
// });

// router.post("/forgot-password", async (req, res, next) => {
//   // 1. Get user based on posted email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return res.status(400).json({ error: "No user found" });
//   }
//   //2generate token

//   const resetToken = user.createPasswordResetToken();
//   await user.save({ requireLogin: false });

//   //3 send as email
//   const resetURL = `${req.protocol}://${req.get(
//     "host"
//   )}/auth/reset-password/${resetToken}`;

//   // const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\n If you did not forget your password please ignore this`;

//   const message = `To reset your password please use this One time password (OTP) \n
//   ${resetToken} \n
//   Do not share this OTP with anyone. Kweeble takes your account security very seriously. Kweeble Customer Service will never ask you to disclose or verify your Kweeble password, OTP, or credit card. If you receive a suspicious email with the link to update your account information, do not click on the link--instead, report the email to Kweeble for investigation. We hope to see you again soon!

//   Thanks for using Kweeble!

//   `;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Your password reset token (valid for 10 minutes)",
//       message,
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email",
//     });
//   } catch (error) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ requireLogin: false });
//     return res.status(500).json({ error: "Email was unable to send" });
//     return res.status(500).json({ error: error });
//   }
// });

// router.patch("/reset-password/:token", async (req, res) => {
//   //1Get user based on the token

//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");
//   // const hashedToken = bcrypt.hash(req.params.token, 256);

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   //2 if token has not expired, and there is a user, set the new password
//   if (!user) {
//     return res.status(400).json({ error: "Token is invalid or has expired" });
//   }

//   user.password = await bcrypt.hash(req.body.password, 10);

//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;

//   await user.save();

//   // log the user in set jwt
//   const token = jwt.sign({ _id: user._id }, secret, {
//     expiresIn: "1h",
//   });

//   return res.status(200).json({ status: "success", token });
// });

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  // const otp = crypto.randomBytes(3).toString("hex");

  const otp = Math.floor(100000 + Math.random() * 900000);

  const confirmation = new Confirmation({
    email,
    confirmationToken: otp,
  });

  await confirmation.save();

  const message = `To reset your password please use this One time password (OTP) \n
    ${otp} \n
    Do not share this OTP with anyone. Kweeble takes your account security very seriously. Kweeble Customer Service will never ask you to disclose or verify your Kweeble password, OTP, or credit card. If you receive a suspicious email with the link to update your account information, do not click on the link--instead, report the email to Kweeble for investigation. We hope to see you again soon!

    Thanks for using Kweeble!`;

  try {
    // await sendEmail({
    //   email: email,
    //   subject: "Kweeble - Reset password",
    //   message: message,
    // });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    // await user.save({ requireLogin: false });
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

  // log the user in set jwt
  const token = jwt.sign({ _id: user._id }, secret, {
    expiresIn: "1h",
  });

  return res.status(200).json({ status: "success", token });
});

router.post("/courses", async (req, res) => {
  try {
    const course = await new Course(req.body).save();
    res.send(course);
  } catch (error) {
    res.send(error);
  }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.send(courses);
  } catch (error) {
    res.send(error);
  }
});

router.put("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(course);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    res.send(course);
  } catch (error) {
    res.send(error);
  }
});

router.post("/items/:course_id", async (req, res) => {
  try {
    const courses = await Course.findById(req.params.course_id);
    courses.items.push(req.body);
    const course = await new Course(courses).save();
    res.send(course.items);
  } catch (error) {
    res.send(error);
  }
});

router.get("/items/:course_id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id);
    res.send(course.items);
  } catch (error) {
    res.send(error);
  }
});

router.put("/items/:course_id/:item_id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id);
    let item = course.items.find((item) => item._id == req.params.item_id);
    item.itemGrade = req.body.itemGrade;
    await new Course(course).save();
    res.send(item);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/items/:course_id/:id", async (req, res) => {
  try {
    let course = await Course.findById(req.params.course_id);
    const filteredItems = course.items.filter(
      (item) => item._id != req.params.id
    );
    course.items = filteredItems;
    await new Course(course).save();
    res.send(course);
  } catch (error) {
    res.send(error);
  }
});

router.post("/grades/:course_id/:item_id", async (req, res) => {
  try {
    const courses = await Course.findById(req.params.course_id);
    const item = courses.items.find((item) => item._id == req.params.item_id);
    item.grades.push(req.body);
    await new Course(courses).save();
    res.send(item);
  } catch (error) {
    res.send(error);
  }
});

router.get("/grades/:course_id/:item_id", async (req, res) => {
  try {
    const courses = await Course.findById(req.params.course_id);
    const item = courses.items.find((item) => item._id == req.params.item_id);
    res.send(item.grades);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/grades/:course_id/:item_id/:grade_id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id);
    let item = course.items.find((item) => item._id == req.params.item_id);
    const filteredGrades = item.grades.filter(
      (grade) => grade._id != req.params.grade_id
    );
    item.grades = filteredGrades;
    await new Course(course).save();
    res.send(item);
  } catch (error) {
    res.send(error);
  }
});

//Add event
router.post("/events", async (req, res) => {
  const {
    name,
    location,
    startDay,
    startTime,
    endDay,
    endTime,
    image,
    description,
    host,
  } = req.body;
  try {
    const event = new Event({
      name,
      location,
      startDay,
      startTime,
      endDay,
      endTime,
      image,
      description,
      host,
    });
    await event.save();

    return res.status(201).json({ message: "Event created succesfully" });
  } catch (error) {
    res.send(error);
  }
});

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.send(events);
  } catch (error) {
    res.send(error);
  }
});

// router.put("/:id", async (req, res) => {
//   try {
//     const { scope, id } = req.body;
//     console.log(req.body, "<===body");
//     const user = await User.update(
//       { _id: id },
//       { $addToSet: { scopes: scope } }
//     );
//     console.log(user, "<==user");
//     await user.save();
//     res.send(user);
//   } catch (error) {
//     res.send(error);
//   }
// });

//Add scope to user
router.put("/:id", async (req, res) => {
  try {
    const { scope, id } = req.body;
    // console.log(req.body, "<===body");
    await User.updateOne({ _id: id }, { $addToSet: { scopes: scope } });
    const user = await User.findOne({ _id: id });
    // console.log(user, "<==user");
    // Subscribe the devices corresponding to the registration tokens to the
    // topic.
    getMessaging()
      .subscribeToTopic(user.registrationTokens, scope._id)
      .then((response) => {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log("Successfully subscribed to topic:", response);
      })
      .catch((error) => {
        console.log("Error subscribing to topic:", error);
      });
    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

//delete scope from user
router.put("/del/:id", async (req, res) => {
  try {
    const { scope, id } = req.body;
    await User.updateOne(
      { _id: req.params.id },
      { $pull: { scopes: { $in: [scope] } } }
    );
    const user = await User.findOne({ _id: id });

    getMessaging()
      .unsubscribeToTopic(user.registrationTokens, scope)
      .then((response) => {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log("Successfully unsubscribed to topic:", response);
      })
      .catch((error) => {
        console.log("Error unsubscribing to topic:", error);
      });
    // console.log(user, "<==user");
    await user.save();
    res.send(user);
  } catch (error) {
    return res.send(error);
  }
});

//Add scope thru username
router.put("/us/:id", async (req, res) => {
  try {
    const { scope, member } = req.body;
    let userx = await User.findOne({ username: member });
    req.params = userx._id;
    // console.log(req.body, "<===body");
    const user = await User.updateOne(
      { _id: userx._id },
      { $addToSet: { scopes: scope } }
    );
    // console.log(user, "<==user");
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//save events
router.put("/events/:id", async (req, res) => {
  try {
    const { event, id } = req.body;
    // console.log(req.body, "<===body");
    const user = await User.updateOne(
      { _id: id },
      { $addToSet: { savedEvents: event } }
    );
    // console.log(user, "<==user");
    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

//save prodct
router.put("/products/:id", async (req, res) => {
  try {
    const { product, id } = req.body;
    // console.log(req.body, "<===body");
    const user = await User.updateOne(
      { _id: id },
      { $addToSet: { savedProducts: product } }
    );
    // console.log(user, "<==user");
    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

//delete event from user
router.put("/events/del/:id", async (req, res) => {
  try {
    const { event, id } = req.body;

    const user = await User.updateOne(
      { _id: req.params.id },
      { $pull: { savedEvents: { $in: [event] } } }
    );
    // console.log(user, "<==user");
    // await user.save();
    res.send(user);
  } catch (error) {
    return res.send(error);
  }
});

//delete product from user
router.put("/products/del/:id", async (req, res) => {
  try {
    const { product, id } = req.body;

    const user = await User.updateOne(
      { _id: req.params.id },
      { $pull: { savedProducts: { $in: [product] } } }
    );
    // console.log(user, "<==user");
    // await user.save();
    res.send(user);
  } catch (error) {
    return res.send(error);
  }
});

//block user
router.put("/block/:id", async (req, res) => {
  try {
    const { person, id } = req.body;
    // console.log(req.body, "<===body");
    const user = await User.updateOne(
      { _id: id },
      { $addToSet: { blockedUsers: person } }
    );
    // console.log(user, "<==user");
    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

//unblock user
router.put("/unblock/:id", async (req, res) => {
  try {
    const { person, id } = req.body;

    const user = await User.updateOne(
      { _id: req.params.id },
      { $pull: { blockedUsers: { $in: [person] } } }
    );
    // console.log(user, "<==user");
    await user.save();
    res.send(user);
  } catch (error) {
    return res.send(error);
  }
});

router.post("/following", async (req, res) => {
  try {
    const user = await User.updateMany({}, { $set: { following: [] } });
    // console.log(user, "<==user");
    await user.save();
    res.send(user);
  } catch (error) {
    return res.send(error);
  }
});

//follow user
router.put("/follow/:id", async (req, res) => {
  try {
    const { person, id } = req.body;
    // console.log(req.body, "<===body");
    const user = await User.updateOne(
      { _id: id },
      { $addToSet: { followers: person } }
    );

    const myUser = await User.updateOne(
      { _id: person },
      { $addToSet: { following: id } }
    );
    // console.log(user, "<==user");
    await user.save();
    await myUser.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

//Unfollow user
router.put("/unfollow/:id", async (req, res) => {
  try {
    const { person, id } = req.body;

    const user = await User.updateOne(
      { _id: req.params.id },
      { $pull: { followers: { $in: [person] } } }
    );

    const myUser = await User.updateOne(
      { _id: person },
      { $pull: { following: { $in: [id] } } }
    );
    // console.log(user, "<==user");
    await user.save();
    await myUser.save();
    res.send(user);
  } catch (error) {
    return res.send(error);
  }
});

//Fetch single user
router.get("/single/:id", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    res.send(user);
    // res.send(scopes);
  } catch (error) {
    res.send(error);
  }
});

// Endpoint to fetch the user's evaConversationHistory
router.get("/conversation-history/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (user && user.evaConversationHistory) {
      res.status(200).json(user.evaConversationHistory);
    } else {
      res.status(404).json({
        message: "User not found or conversation history not available.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

//clear chat history with eva
// Server-side route handler to delete all messages for a user
router.put("/delete/messages", async (req, res) => {
  try {
    const { userId } = req.body;

    // Retrieve the user's conversation history from the data storage
    const user = await User.findById(userId);
    if (!user) {
      // User not found, return an error response
      return res.status(404).json({ error: "User not found" });
    }

    // Clear the user's conversation history
    user.evaConversationHistory = [];

    // Update your data storage to reflect the modified conversation history
    await user.save();

    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
  }
});

//like message
router.put("/like/message", async (req, res) => {
  try {
    const { userId, msgId } = req.body;

    // Retrieve the user's document from the data storage
    const user = await User.findById(userId);
    if (!user) {
      // User not found, return an error response
      return res.status(404).json({ error: "User not found" });
    }

    // Find the specific message in the user's conversation history
    let message = user.evaConversationHistory.id(msgId);
    if (!message) {
      // Message not found, return an error response
      return res.status(404).json({ error: "Message not found" });
    }

    // Set the isLiked field of the message to true
    // This will create the isLiked field if it doesn't exist
    message.isLiked = true;
    // message.set({ isLiked: true });

    user.markModified("evaConversationHistory");

    // Save the user document
    await user.save();

    // Response success
    res.status(200).json({ message: "success message set to liked" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while liking the message" });
  }
});

//dislike
router.put("/dislike/message", async (req, res) => {
  try {
    const { userId, msgId } = req.body;

    // Retrieve the user's document from the data storage
    const user = await User.findById(userId);
    if (!user) {
      // User not found, return an error response
      return res.status(404).json({ error: "User not found" });
    }

    // Find the specific message in the user's conversation history
    let message = user.evaConversationHistory.id(msgId);
    if (!message) {
      // Message not found, return an error response
      return res.status(404).json({ error: "Message not found" });
    }

    // Set the isLiked field of the message to true
    // This will create the isLiked field if it doesn't exist
    message.isLiked = false;
    // message.set({ isLiked: true });

    user.markModified("evaConversationHistory");

    // Save the user document
    await user.save();

    // Response success
    res.status(200).json({ message: "success message set to disliked" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while liking the message" });
  }
});

//Add scope to user
router.put("/:id", async (req, res) => {
  try {
    const { scope, id } = req.body;
    // console.log(req.body, "<===body");
    await User.updateOne({ _id: id }, { $addToSet: { scopes: scope } });
    const user = await User.findOne({ _id: id });
    // console.log(user, "<==user");
    // Subscribe the devices corresponding to the registration tokens to the
    // topic.
    getMessaging()
      .subscribeToTopic(user.registrationTokens, scope._id)
      .then((response) => {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log("Successfully subscribed to topic:", response);
      })
      .catch((error) => {
        console.log("Error subscribing to topic:", error);
      });
    await user.save();
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
