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
const { getFirestore } = require("firebase-admin/firestore");

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
    media,
    modOnly,
    repeat,
    date,
    notify,
    notificationTime,
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
      media,
      modOnly,
      repeat,
      date,
      notify,
      notificationTime,
    });
    await event.save();

    // We will add a notification to firestore
    const docRef = getFirestore().collection("notifications").doc(uuidv4());
    await docRef.set({
      title: name,
      body: description,
      topic: scope,
      data: {},
      sent: false,
      cancel: false,
      scheduledTime: notificationTime :  , // ToDo : setting the correct date time
    });

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
router.delete("/del/:id", async (req, res) => {
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
      media,
      modOnly,
      repeat,
      date,
      notify,
      notificationTime,
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
      media,
      modOnly,
      repeat,
      date,
      notify,
      notificationTime,
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

//add mod view
router.post("/modonly", async (req, res) => {
  try {
    const event = await Event.updateMany({}, { $set: { modOnly: false } });
    // console.log(user, "<==user");
    await event.save();
    res.send(event);
  } catch (error) {
    return res.send(error);
  }
});

//add mod view
router.post("/addDate/:id", async (req, res) => {
  try {
    // const event = await Event.findOne({ _id: req.params.id });
    const eventUpdated = await Event.updateOne(
      { _id: req.params.id },
      {
        $set: {
          date: new Date(`2023-05-06T12:00:00Z`),
        },
      }
    );
    // console.log(user, "<==user");
    await eventUpdated.save();
    res.send(eventUpdated);
  } catch (error) {
    return res.send(error);
  }
});

//Fetch single event
router.get("/single/:id", async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id });

    res.send(event);
    // res.send(scopes);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
