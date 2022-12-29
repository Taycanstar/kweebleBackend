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
const Product = require("../models/Product");
const Notification = require("../models/Notification");

const secret = "test";

//new notification
router.post("/new", async (req, res) => {
  const { text, type, typeId, time, to, from, photo } = req.body;

  try {
    const notification = new Notification({
      text,
      type,
      typeId,
      time,
      to,
      from,
      photo,
    });
    await notification.save();

    return res.status(201).json({
      message: "Notification created succesfully",
      notification: notification,
    });
  } catch (error) {
    res.send(error);
  }
});

//Fetch all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.send(notifications);
  } catch (error) {
    res.send(error);
  }
});

//Delete notification
router.delete("/del", async (req, res) => {
  const { typeId } = req.body;
  try {
    const notification = await Notification.deleteMany({ typeId: typeId });
    res.send(notification);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
