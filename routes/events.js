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
const Event = require("../models/Event");

const secret = "test";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    public_id: (req, file) => Date.now(),
  },
});

const upload = multer({ storage: storage });

router.use("/image", express.static("uploads"));

router.use("/icon", express.static("uploads"));

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

    res.status(200).json({ imageURL: req.file });
  }
);

router.post("/icon", requireLogin, upload.single("icon"), async (req, res) => {
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

  res.status(200).json({ iconURL: req.file.path });
});

//Add event
router.post("/", async (req, res) => {
  const {
    name,
    location,
    month,
    day,
    year,
    startTime,
    endDay,
    endTime,
    datetime,
    latitude,
    longitude,
    image,
    description,
    user,
    host,
    icon,
  } = req.body;

  try {
    const event = new Event({
      name,
      location,
      month,
      day,
      year,
      startTime,
      endDay,
      endTime,
      datetime,
      latitude,
      longitude,
      image,
      description,
      user,
      host,
      icon,
    });
    await event.save();

    return res.status(201).json({ message: "Event created succesfully" });
  } catch (error) {
    res.send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.send(events);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
