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

router.post(
  "/image",
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
router.post("/", upload.single("image"), async (req, res) => {
  const {
    name,
    location,
    startDay,
    startTime,
    endDay,
    endTime,
    image,
    description,
    user,
  } = req.body;

  try {


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
   console.log("processed image ===>", req.file.path;)

    return res.status(201).json({ message: "Event created succesfully", image: req.file.path })


// if(req.file.path){
//     const event = new Event({
//       name,
//       location,
//       startDay,
//       startTime,
//       endDay,
//       endTime,
//       image: req.file.path,
//       description,
//       user,
//     });
//     await event.save();

//     return res.status(201).json({ message: "Event created succesfully" });
// }else{
//   console.log("image still processing...")
// }
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