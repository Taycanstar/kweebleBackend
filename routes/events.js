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
    notificationTime,
    notiText,
    link,
    endDate,
    notificationDescription,
  } = req.body;
  try {
    if (name === "" || name === undefined) {
      return res.status(400).json({ error: "Title of the event is required" });
    }
    if (location === "" || location === undefined) {
      return res
        .status(400)
        .json({ error: "Location of the event is required" });
    }
    if (scope === "" || scope === undefined) {
      return res.status(400).json({ error: "Scope of the event is required" });
    }
    if (date === "" || date === undefined) {
      return res.status(400).json({ error: "Date of the event is required" });
    }

    if (startTime === "" || startTime === undefined) {
      return res.status(400).json({ error: "Time of the event is required" });
    }
    if (month === "" || month === undefined) {
      return res.status(400).json({ error: "Date of the event is required" });
    }

    if (day === "" || day === undefined) {
      return res.status(400).json({ error: "Date of the event is required" });
    }

    if (year === "" || year === undefined) {
      return res.status(400).json({ error: "Date of the event is required" });
    }

    if (date === "" || date === undefined) {
      return res.status(400).json({ error: "Date of the event is required" });
    }

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
      notificationTime,
      notiText,
      link,
      endDate,
      notificationDescription,
    });

    //new
    if (notificationTime != null) {
      // Generate a unique ID for the notification
      const notificationId = await getFirestore()
        .collection("notifications")
        .doc().id;

      // Save the notification ID in the event
      event.notificationId = notificationId;

      const docRef = await getFirestore()
        .collection("notifications")
        .doc(notificationId)
        .set({
          title: name,
          body:
            notificationDescription !== ""
              ? notificationDescription
              : `Starting at ${startTime}`,
          topic: scope,
          data: {},
          sent: false,
          cancel: false,
          scheduledTime: new Date(notificationTime),
        });
    }

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
      notiText,
      link,
      endDate,
      notificationDescription,
    } = req.body;

    const singleEvent = await Event.findById(req.params.id);
    const notiTextBefore = singleEvent.notiText;
    const notiTimeBefore = singleEvent.notificationTime;

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
      notiText,
      link,
      endDate,
      notificationDescription,
    });

    const notificationId = event.notificationId;

    // const scope = await Scope.updateOne(
    //   { _id: req.params.id },
    //   { photo: photo }
    // );

    // We will add a notification to firestore
    if (notificationTime !== notiTimeBefore) {
      // const docRef = getFirestore().collection("notifications").doc(uuidv4());
      // if (notificationTime != null) {
      //   await docRef.set({
      //     title: name,
      //     body: description,
      //     topic: scope,
      //     data: {},
      //     sent: false,
      //     cancel: false,
      //     scheduledTime: new Date(notificationTime), // ToDo : setting the correct date time
      //   });
      // }
      const docRef = getFirestore()
        .collection("notifications")
        .doc(notificationId); // use existing notificationId

      if (notificationTime != null) {
        await docRef.update({
          title: name,
          body:
            notificationDescription !== ""
              ? notificationDescription
              : `Starting at ${startTime}`,
          topic: scope,
          sent: false,
          scheduledTime: new Date(notificationTime), // make sure to update the scheduled time too
        });
      }
    }

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

// Fetch saved events for a specific user
router.get("/savedEvents/:userId", async (req, res) => {
  try {
    // Get the user from the database using their id
    const user = await User.findById(req.params.userId);

    // If user was not found, send a 404 response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the saved events
    res.json(user.savedEvents);
  } catch (error) {
    // If an error occurred, send a 500 response
    res.status(500).json({ message: error.message });
  }
});

router.get("/saved", async (req, res) => {
  try {
    const events = await Event.find();
    res.send(events);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
