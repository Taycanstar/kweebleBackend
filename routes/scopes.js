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
const Scope = require("../models/Scope");

const secret = "test";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "scopePP",
    public_id: (req, file) => Date.now(),
  },
});

const upload = multer({ storage: storage });

router.use("/image", express.static("scopePP"));

router.post(
  "/image",
  requireLogin,
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

    res.status(200).json({ imageURL: req.file.path });
  }
);

//Add scope
router.post("/newScope", async (req, res) => {
  const {
    name,
    isScope,
    info,
    photo,
    membership,
    members,
    messages,
    moderators,
  } = req.body;

  try {
    const scope = new Scope({
      name,
      info,
      photo,
      isScope,
      membership,
      members,
      messages,
      moderators,
    });
    await scope.save();

    return res
      .status(201)
      .json({ message: "Scope created succesfully", scope: scope });
  } catch (error) {
    res.send(error);
  }
});

//Fetch all scopes
router.get("/", async (req, res) => {
  try {
    const scopes = await Scope.find();
    res.send(scopes);
  } catch (error) {
    res.send(error);
  }
});

//Delete scope
router.delete("/newScopes/:id", async (req, res) => {
  try {
    const scope = await Scope.findByIdAndDelete(req.params.id);
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

//Add member
router.put("/:id", async (req, res) => {
  try {
    const { member, id } = req.body;

    // console.log(req.body, "<===body");
    const scope = await Scope.updateOne(
      { _id: req.params.id },
      { $addToSet: { members: member } }
    );
    // console.log(user, "<==user");
    await scope.save();
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

//delete member
router.put("/del/:id", async (req, res) => {
  try {
    const { mem, id } = req.body;

    console.log(req.body, "<===body");
    const scope = await Scope.updateOne(
      { _id: req.params.id },
      { $pull: { members: { $in: [mem] } } }
    );
    // console.log(user, "<==user");
    await scope.save();
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

//Edit photo
router.put("/edit/:id", async (req, res) => {
  try {
    const { name, info, type, photo, id } = req.body;

    const scope = await Scope.findByIdAndUpdate(req.params.id, {
      name: name,
      info: info,
      membership: type,
      photo: photo,
    });

    // const scope = await Scope.updateOne(
    //   { _id: req.params.id },
    //   { photo: photo }
    // );
    console.log(scope, "<=scope");

    await scope.save();
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

//Add mod
router.put("/mod/:id", async (req, res) => {
  try {
    const { member, id } = req.body;

    // console.log(req.body, "<===body");
    const scope = await Scope.updateOne(
      { _id: req.params.id },
      { $addToSet: { moderators: member } }
    );
    // console.log(user, "<==user");
    await scope.save();
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

//delete mod
router.put("/mod/del/:id", async (req, res) => {
  try {
    const { mem, id } = req.body;

    console.log(req.body, "<===body");
    const scope = await Scope.updateOne(
      { _id: req.params.id },
      { $pull: { moderators: { $in: [mem] } } }
    );
    // console.log(user, "<==user");
    await scope.save();
    res.send(scope);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
