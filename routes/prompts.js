const axios = require("axios");
const express = require("express");
const router = require("express").Router();
const { MongoClient } = require("mongodb");
const Event = require("../models/Event");

const key = process.env.GP3_API_KEY;
// MongoDB connection URI
const uri = process.env.MONGODB_URI;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

async function generateResponse(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/engines/davinci-codex/completions",
    {
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.5,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].text.trim();
}

// Assume you have a function getUpcomingEvents() that returns a list of upcoming events
async function getUpcomingEvents() {
  try {
    // Connect to the MongoDB database
    const client = new MongoClient(uri);
    await client.connect();

    // Access the events collection
    const db = client.db();
    const eventsCollection = db.collection("events");

    // Fetch the first 3 most recent events from the database
    const recentEvents = await eventsCollection
      .find()
      .sort({ date: -1 })
      .limit(3)
      .toArray();

    const formattedEvents = recentEvents.map((event) => {
      // Format the event data into a string
      // This is just an example, you would replace 'eventName', 'eventDate', etc. with your actual event properties
      return `Event: ${event.name}, Date: ${months[event.month - 1]} ${
        event.day
      }, ${event.year}, Location: ${event.location}`;
    });
  } catch (error) {
    console.log(error);
  }
  // Query your database and return a list of upcoming events
}

// Assume you have a function getEventAttendees(eventName) that returns a list of attendees for a specific event
async function getEventAttendees(eventName) {
  // Query your database and return a list of attendees for the specified event
}

// Assume you have a function extractEventName(userPrompt) that extracts the event name from the user's question
function extractEventName(userPrompt) {
  // Extract the event name from the user's question
}

router.post("/ask", async (req, res) => {
  let userPrompt = req.body.question;

  if (userPrompt.toLowerCase().includes("upcoming events")) {
    let upcomingEvents = await getUpcomingEvents();
    let eventsStr = formattedEvents.join(", ");
    let fullPrompt = `${userPrompt}\nAssistant: The upcoming events are: ${eventsStr}`;
    let response = await generateResponse(fullPrompt);
    res.json({ response: response });
  } else if (
    userPrompt.toLowerCase().includes("who") &&
    userPrompt.toLowerCase().includes("going")
  ) {
    let eventName = extractEventName(userPrompt);
    let attendees = await getEventAttendees(eventName);
    let attendeesStr = attendees.join(", ");
    let fullPrompt = `${userPrompt}\nAssistant: The people going to the event are: ${attendeesStr}`;
    let response = await generateResponse(fullPrompt);
    res.json({ response: response });
  } else {
    // Handle other types of questions or default case
    generateResponse(userPrompt);
  }
});

module.exports = router;
