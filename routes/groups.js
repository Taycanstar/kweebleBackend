const express = require("express");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Group = require("../models/Group");
const { requireLogin } = require("../middleware/auth");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { copyFile, mkdir } = require("fs/promises");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    public_id: (req, file) => Date.now(),
  },
});

const upload = multer({ storage: storage });

router.use("/image", express.static("uploads"));

router.post(
  "/image",
  requireLogin,
  upload.single("image"),
  async (req, res) => {
    console.log("File is: ", req.file);

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

    res.status(200).json({ imageURL: req.file.path });
  }
);

router.post("/", async (req, res) => {
  const { name, photo, description, members, messages, admins, isGroup } =
    req.body;

  try {
    const group = new Group({
      name,
      photo,
      description,
      members,
      messages,
      admins,
      isGroup,
    });
    await group.save();

    return res
      .status(201)
      .json({ message: "group created succesfully", groupId: group._id });
  } catch (error) {
    res.send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const groups = await Group.find();
    res.send(groups);
  } catch (error) {
    res.send(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      description: req.body.description,
    });

    // const name = req.body.name;

    // message.receiverHasRead = receiverHasRead;
    await group.save();
  } catch (error) {
    res.send(error);
  }
});

//Delete group
router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    res.send(group);
  } catch (error) {
    res.send(error);
  }
});

router.put("/participants/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, {
      participants: req.body.participants,
    });

    // const name = req.body.name;

    // message.receiverHasRead = receiverHasRead;
    await group.save();
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
