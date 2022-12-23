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
const Product = require("../models/Product");
const Scope = require("../models/Scope");

const secret = "test";

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "uploads",
//     public_id: (req, file) => Date.now(),
//   },
// });

// const upload = multer({ storage: storage });

// router.use("/image", express.static("uploads"));

// router.post(
//   "/image",

//   upload.single("image"),
//   async (req, res) => {
//     console.log("File is: ", req.file);

//     if (req.file.size > 2 * 3000 * 3000) {
//       res.status(400).json({ error: "max file size of 2MB exceeded" });
//       return;
//     }

//     let ext;
//     switch (req.file.mimetype) {
//       case "image/jpeg":
//         ext = "jpg";
//         break;
//       case "image/png":
//         ext = "png";
//         break;
//       default:
//         res.status(400).json({ error: "bad content type" });
//         return;
//     }

//     console.log("ress", res);

//     res.status(200).json({ imageURL: req.file.path });
//   }
// );

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    public_id: (req, file) => Date.now(),
  },
});

const upload = multer({ storage: storage });

router.use("/photo", express.static("uploads"));

router.post(
  "/photo",
  requireLogin,
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

    req.user.photo = req.file.path;
    await req.user.save();

    res.status(200).json(req.user);
  }
);

//Add event
router.post("/newScope", async (req, res) => {
  const {
    name,
    isScope,
    info,
    photo,
    membership,
    members,
    messages,
    moderators,
  } = req.body;

  try {
    const scope = new Scope({
      name,
      info,
      photo,
      isScope,
      membership,
      members,
      messages,
      moderators,
    });
    await scope.save();

    return res
      .status(201)
      .json({ message: "Scope created succesfully", scope: scope });
  } catch (error) {
    res.send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const scopes = await Scope.find();
    res.send(scopes);
  } catch (error) {
    res.send(error);
  }
});

//Delete event
router.delete("/newScopes/:id", async (req, res) => {
  try {
    const scope = await Scope.findByIdAndDelete(req.params.id);
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

//Add member
router.put("/:id", async (req, res) => {
  try {
    const { member, id } = req.body;

    // console.log(req.body, "<===body");
    const scope = await Scope.updateOne(
      { _id: req.params.id },
      { $addToSet: { members: member } }
    );
    // console.log(user, "<==user");
    await scope.save();
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

//delete member
router.put("/del/:id", async (req, res) => {
  try {
    const { mem, id } = req.body;

    console.log(req.body, "<===body");
    const scope = await Scope.updateOne(
      { _id: req.params.id },
      { $pull: { members: { $in: [mem] } } }
    );
    // console.log(user, "<==user");
    await scope.save();
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

//Edit photo
router.put("photo/:id", async (req, res) => {
  try {
    const { photo, id } = req.body;

    // console.log(req.body, "<===body");
    const scope = await Scope.updateOne(
      { _id: req.params.id },
      { photo: photo }
    );
    // console.log(user, "<==user");
    await scope.save();
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
