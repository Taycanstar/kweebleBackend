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
  const { name,groupPhoto, description, admin} =
    req.body;
  try {
    const group = new Group(
      name,
    //   messages,
      admin,
    //   members,
      groupPhoto,
      description
    );
    await group.save();
   
    return res.status(201).json({ message: "Group created succesfully" });
  } catch (error) {
    res.send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const groups = await Group.find();
    res.send(groups);
  } catch (error) {
    res.send(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(group);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    res.send(group);
  } catch (error) {
    res.send(error);
  }
});

router.post("/users/:course_id", async (req, res) => {
  try {
    const courses = await Course.findById(req.params.course_id);
    courses.items.push(req.body);
    const course = await new Course(courses).save();
    res.send(course.items);
  } catch (error) {
    res.send(error);
  }
});

router.get("/items/:course_id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id);
    res.send(course.items);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
