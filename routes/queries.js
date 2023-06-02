const axios = require("axios");
const express = require("express");
const router = require("express").Router();
const { MongoClient } = require("mongodb");
const Event = require("../models/Event");
const { Configuration, OpenAIApi } = require("openai");

const key = process.env.GP3_API_KEY;
// MongoDB connection URI
const uri = process.env.MONGODB_URI;

const configuration = new Configuration({
  apiKey: process.env.GP3_API_KEY,
});

router.post("/new", async (req, res) => {
  const { prompt } = req.body;
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
    });
    console.log(completion.data.choices[0].text);
    res.send(completion.data.choices[0].text);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
});

module.exports = router;
