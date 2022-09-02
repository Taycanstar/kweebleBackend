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
const Message = require("../models/Message");

router.post("/", async (req, res) => {
  const { name, text, user, timestamp, recipient, receiverHasRead, isGroup } =
    req.body;

  try {
    const message = new Message({
      name,
      text,
      timestamp,
      recipient,
      user,
      receiverHasRead,
      isGroup,
    });
    await message.save();

    return res.status(201).json({ message: "Message created succesfully" });
  } catch (error) {
    res.send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find();
    res.send(messages);
  } catch (error) {
    res.send(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, {
      receiverHasRead: req.body.receiverHasRead,
    });

    const receiverHasRead = req.body.receiverHasRead;

    message.receiverHasRead = receiverHasRead;
    await message.save();
  } catch (error) {
    res.send(error);
  }
});

//Delete message
router.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    res.send(message);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
