const express = require("express");
const axios = require("axios");
const router = require("express").Router();

const key = process.env.GP3_API_KEY;

router.post("/api/gpt3", async (req, res) => {
  const { query } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt: query,
        max_tokens: 100,
        temperature: 0.8,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
      }
    );

    const output = response.data.choices[0].text.trim();
    res.json({ response: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
