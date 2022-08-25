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

router.use("/image", express.static("uploads"));

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    public_id: (req, file) => Date.now(),
  },
});

const multi_upload = multer({
  storage,
  limits: { fileSize: 1 * 3000 * 3000 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error("Only .png, .jpg and .jpeg format allowed!");
      err.name = "ExtensionError";
      return cb(err);
    }
  },
}).array("uploadedImages", 10);

router.post("/image", (req, res) => {
  multi_upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res
        .status(500)
        .send({ error: { message: `Multer uploading error: ${err.message}` } })
        .end();
      return;
    } else if (err) {
      // An unknown error occurred when uploading.
      if (err.name == "ExtensionError") {
        res
          .status(413)
          .send({ error: { message: err.message } })
          .end();
      } else {
        res
          .status(500)
          .send({
            error: { message: `unknown uploading error: ${err.message}` },
          })
          .end();
      }
      return;
    }

    // Everything went fine.
    // show file `req.files`
    // show body `req.body`
    // res.status(200).end("Your files uploaded.");
    res.status(200).json({ imagesURL: req.file.path });
  });
});

//Add product
router.post("/", async (req, res) => {
  const { title, description, photos, category, price, condition, seller } =
    req.body;

  try {
    const product = new Product({
      title,
      description,
      photos,
      category,
      price,
      condition,
      seller,
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
