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

router.post("/image", upload.array(), async (req, res) => {
  //   console.log("File is: ", req.file);

  //   if (req.file.size > 2 * 3000 * 3000) {
  //     res.status(400).json({ error: "max file size of 2MB exceeded" });
  //     return;
  //   }

  //   let ext;
  //   switch (req.file.mimetype) {
  //     case "image/jpeg":
  //       ext = "jpg";
  //       break;
  //     case "image/png":
  //       ext = "png";
  //       break;
  //     default:
  //       res.status(400).json({ error: "bad content type" });
  //       return;
  //   }

  res.status(200).json({ images: req.files.map((file) => file.path) });
});

//Add product
router.post("/", async (req, res) => {
  const {
    title,
    description,
    photos,
    category,
    price,
    condition,
    seller,
    sellerPhoto,
    sellerName,
    sellerGradeLevel,
    sellerMajor,
    sellerUsername,
  } = req.body;

  try {
    const product = new Product({
      title,
      description,
      photos,
      category,
      price,
      condition,
      seller,
      sellerPhoto,
      sellerName,
      sellerGradeLevel,
      sellerMajor,
      sellerUsername,
    });
    await product.save();

    return res.status(201).json({ message: "Product created succesfully" });
  } catch (error) {
    res.send(error);
  }
});

//Get Product
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
