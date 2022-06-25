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
const Course = require("../models/Event");

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

router.post(
  "/eventImage",
  requireLogin,
  upload.single("image"),
  async (req, res) => {
    console.log("File is: ", req.file);

    // TODO: Convert into appropriate dimensions (save a thumbnail)

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

    req.event.image = req.file.path;
    await req.event.save();

    res.status(200).json(req.event);
  }
);

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
