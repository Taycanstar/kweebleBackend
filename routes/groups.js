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

// router.post("/", async (req, res) => {
//   const { name,groupPhoto, description, admin} =
//     req.body;
//   try {
//     const group = new Group(
//       name,
//       admin,
//       groupPhoto,
//       description
//     );
//     await group.save();
   
//     return res.status(201).json({ message: "Group created succesfully" });
//   } catch (error) {
//     res.send(error);
//   }
// });

router.post("/", async (req, res) => {
  const {
    name,
groupPhoto
  } = req.body;

  try {
    const group = new group({
      name,
   groupPhoto
    });
    await group.save();

    return res.status(201).json({ message: "group created succesfully" });
  } catch (error) {
    res.send(error);
  }
});


module.exports = router;
