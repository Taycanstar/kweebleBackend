const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    photos: { type: Array, required: true },
    category: { type: String },
    condition: { type: String },
    price: { type: Number, required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerPhoto: { type: String },
    sellerName: { type: String },
    sellerGradeLevel: { type: String },
    sellerMajor: { type: String },
    sellerUsername: { type: String },
    scope: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scope",
    },
    isSold: {
      type: Boolean,
    },
  },

  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
