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
const Report = require("../models/Report");

//new report
router.post("/", async (req, res) => {
  const { reason, reportedUser, name, reportedItem } = req.body;

  try {
    const report = new Report({
      reason,
      reportedUser,
      name,
      reportedItem,
    });

    // console.log(req.body, "lol");
    await report.save();

    return res
      .status(201)
      .json({ message: "Report created succesfully", report: report });
  } catch (error) {
    res.send(error);
  }
});

//Fetch all notifications
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();
    res.send(reports);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
