const axios = require("axios");
const express = require("express");
const router = require("express").Router();
const { MongoClient } = require("mongodb");
const Event = require("../models/Event");
const { Configuration, OpenAIApi } = require("openai");

const key = process.env.OPENAI_KEY;
// MongoDB connection URI
const uri = process.env.MONGODB_URI;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

router.post("/new", async (req, res) => {
  const { prompt } = req.body;
  try {
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt: prompt,
    });
    const response = completion.data.choices[0].text;
    console.log(response);
    // res.send();
    res.status(200).json(response);
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
