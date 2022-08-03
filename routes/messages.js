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
  const { name, text, user, timestamp, recipient, receiverHasRead } = req.body;

  try {
    const message = new Message({
      name,
      text,
      timestamp,
      recipient,
      user,
      receiverHasRead,
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
      const  message  = await Message.findById(req.message.id).select("+receiverHasRead");
      //2 check is posted current password is correct
      const receiverHasRead = req.body.receiverHasRead
      //3if so, update password
      message.receiverHasRead = receiverHasRead;
    // const= await Message.findByIdAndUpdate(req.params.id, req.body, {
    // });
    // const {receiverHasRead} = req.body;
    // message.receiverHasRead = receiverHasRead;

    await message.save();
  } catch (error) {
    res.send(error);
  }
});


module.exports = router;
