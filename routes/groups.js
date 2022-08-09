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

router.post("/", async (req, res) => {
  const {
    name,
groupPhoto,
description,
members,
messages
  } = req.body;

  try {
    const group = new Group({
      name,
   groupPhoto,
   description,
   members,
   messages
    });
    await group.save();

    return res.status(201).json({ message: "group created succesfully" });
  } catch (error) {
    res.send(error);
  }
});


module.exports = router;
