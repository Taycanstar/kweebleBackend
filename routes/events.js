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
  // requireLogin,
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

    // console.log("ress", res);

    // const img = JSON.parse(JSON.stringify(req.file.path));

    // res.status(200).json(img);

    res.status(201).json(req.file.path);
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
    scope,
    users,
    hostName,
  } = req.body;

  if (name === "" || name === undefined) {
    return res.status(400).json({ error: "Title of the event is required" });
  }
  if (location === "" || location === undefined) {
    return res.status(400).json({ error: "Location of the event is required" });
  }
  if (scope === "" || scope === undefined) {
    return res.status(400).json({ error: "Scope of the event is required" });
  }
  if (month === "" || month === undefined) {
    return res.status(400).json({ error: "Date of the event is required" });
  }

  if (year === "" || year === undefined) {
    return res.status(400).json({ error: "Date of the event is required" });
  }

  if (day === "" || day === undefined) {
    return res.status(400).json({ error: "Date of the event is required" });
  }

  if (startTime === "" || startTime === undefined) {
    return res.status(400).json({ error: "Time of the event is required" });
  }

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
      scope,
      users,
      hostName,
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

router.put("/:id", async (req, res) => {
  try {
    const { id, going, goingBtn, goingBtnText } = req.body;

    const singleEvent = await Event.findById(req.params.id);
    const clientEventdata = {
      id,
      going,
      goingBtn,
      goingBtnText,
    };
    //singleEvent.data.users.push(clientEventdata);
    // await Event.save(singleEvent);

    const sameUser = singleEvent.users.find((user) => user.id == id);
    //console.log(sameUser);
    //res.send(singleEvent);

    if (sameUser) {
      const sameUser = singleEvent.users.find((user) => user.id == id);
      singleEvent.users = singleEvent.users.map((i) =>
        i.id == id ? req.body : i
      );

      await singleEvent.save();
      res.send(singleEvent);
    } else {
      const event = await Event.updateOne(
        { _id: req.params.id },
        { $addToSet: { users: clientEventdata } }
      );
      res.send(event);
    }
  } catch (error) {
    res.send(error);
  }
});

//Delete event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    res.send(event);
  } catch (error) {
    res.send(error);
  }
});

//Edit event
router.put("/edit/:id", async (req, res) => {
  try {
    const {
      name,
      location,
      month,
      day,
      year,
      startTime,
      endTime,
      datetime,
      image,
      latitude,
      longitude,
      description,
      icon,
      scope,
      host,
      id,
    } = req.body;

    const event = await Event.findByIdAndUpdate(req.params.id, {
      name,
      location,
      month,
      day,
      year,
      startTime,
      endTime,
      datetime,
      image,
      latitude,
      longitude,
      description,
      icon,
      scope,
      host,
      id,
    });

    // const scope = await Scope.updateOne(
    //   { _id: req.params.id },
    //   { photo: photo }
    // );
    console.log(event, "<=event");

    await event.save();
    res.send(event);
  } catch (error) {
    res.send(error);
  }
});

//Add media
router.post("/media", upload.any(), async (req, res) => {
  res.status(201).json(req.files.map((file) => file.path));
});

module.exports = router;
