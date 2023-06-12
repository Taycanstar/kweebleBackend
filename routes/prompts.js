const axios = require("axios");
const express = require("express");
const router = require("express").Router();
const { MongoClient } = require("mongodb");
const Event = require("../models/Event");
const { Configuration, OpenAIApi } = require("openai");
const customResponses = require("../utils/customResponses");
const keywords = require("../utils/keywords");
const User = require("../models/User"); // Assuming you have a User model
const moment = require("moment");

const extractDate = (prompt) => {
  const matches = prompt.match(/events on (.+)/i);
  if (matches && matches.length > 1) {
    let dateString = matches[1];
    // Define the accepted date formats
    const dateFormats = [
      "MMMM D, YYYY",
      "M-D-YYYY",
      "M/D/YYYY",
      "MMMM D YYYY",
      "D MMMM YYYY",
    ];
    let date;

    // Attempt to parse the date using each format
    for (let format of dateFormats) {
      date = moment(dateString, format);
      if (date.isValid()) {
        return date.format("MMMM D, YYYY");
      }
    }

    // If none of the formats match, return null
    return null;
  }
  return null;
};

const extractDate2 = (prompt) => {
  const matches = prompt.match(/events happening on (.+)/i);
  if (matches && matches.length > 1) {
    let dateString = matches[1];
    // Define the accepted date formats
    const dateFormats = [
      "MMMM D, YYYY",
      "M-D-YYYY",
      "M/D/YYYY",
      "MMMM D YYYY",
      "D MMMM YYYY",
    ];
    let date;

    // Attempt to parse the date using each format
    for (let format of dateFormats) {
      date = moment(dateString, format);
      if (date.isValid()) {
        return date.format("MMMM D, YYYY");
      }
    }

    // If none of the formats match, return null
    return null;
  }
  return null;
};

const key = process.env.OPENAI_KEY;
// MongoDB connection URI
const uri = process.env.MONGODB_URI;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

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

const extractLocation = (prompt) => {
  const matches = prompt.match(/events at (.+)\?/i);
  if (matches && matches.length > 1) {
    return matches[1];
  }
  return null;
};

router.post("/new", async (req, res) => {
  const { prompt, userId } = req.body;
  let evaConversationHistory = [];
  let wasChatEmpty;

  const user = await User.findById(userId);

  if (user && user.evaConversationHistory) {
    evaConversationHistory = user.evaConversationHistory;
  }

  const lowerCasePrompt = prompt.toLowerCase();

  const upcomingEvents = await Event.find().sort({ date: -1 }).limit(3);
  const formattedEvents = upcomingEvents
    .map((event, index) => {
      const dateString = `${months[event.month - 1]} ${event.day}, ${
        event.year
      }`;
      return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
    })
    .join("\n");

  let keyword = null;
  for (const prompt in keywords) {
    if (lowerCasePrompt.includes(prompt)) {
      keyword = keywords[prompt];
      break;
    }
  }

  let keywordEvents = [];
  if (keyword) {
    const keyvs = await Event.find({ $text: { $search: keyword } })
      .sort({ date: -1 })
      .limit(5);
    if (keyvs.length === 0) {
      keywordEvents = [`There are no ${keyword} events.`];
    } else {
      keywordEvents = keyvs
        .map((event, index) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
    }
  }

  const data = {
    prompt,
    formattedEvents,
    keywordEvents,
  };

  try {
    let response;

    for (const keyword in customResponses) {
      if (lowerCasePrompt.includes(keyword)) {
        evaConversationHistory.push({ role: "user", content: prompt });
        if (keyword === "events at") {
          const location = extractLocation(prompt);
          const events = await Event.find({ location }).limit(5);

          if (events.length === 0) {
            response = `We couldn't find any events at ${location}.`;
          } else {
            const formatEvents = events
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}\n`;
              })
              .join("");
            response = `Here are some events happening at ${location}:\n${formatEvents}\n`;
          }
        } else if (keyword === "events happening on") {
          const date = extractDate2(prompt);

          if (date) {
            const events = await Event.find({
              date: { $gte: date, $lt: moment(date).endOf("day").toDate() },
            }).limit(5);

            if (events.length === 0) {
              response = `We couldn't find any events on ${date}.`;
            } else {
              const formatEvents = events
                .map((event) => {
                  const dateString = `${months[event.month - 1]} ${
                    event.day
                  }, ${event.year}`;
                  return `◦ ${event.name} at ${event.location} on ${dateString}\n`;
                })
                .join("");
              response = `Here are some events happening on ${date}:\n${formatEvents}\n`;
            }
          }
          // continue;
        } else if (keyword === "events on") {
          const date = extractDate(prompt);

          if (date) {
            const events = await Event.find({
              date: { $gte: date, $lt: moment(date).endOf("day").toDate() },
            }).limit(5);

            if (events.length === 0) {
              response = `We couldn't find any events on ${date}.`;
            } else {
              const formatEvents = events
                .map((event) => {
                  const dateString = `${months[event.month - 1]} ${
                    event.day
                  }, ${event.year}`;
                  return `◦ ${event.name} at ${event.location} on ${dateString}\n`;
                })
                .join("");
              response = `Here are some events happening on ${date}:\n${formatEvents}\n`;
            }
          }
          // continue;
        } else {
          response = customResponses[keyword](data);
        }
        evaConversationHistory.push({ role: "assistant", content: response });
        break;
      }
    }

    const newConvo = evaConversationHistory.map(({ role, content }) => {
      return { role, content };
    });
    if (!response) {
      evaConversationHistory.push({
        role: "user",
        content: prompt,
      });

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: newConvo,
        temperature: 0.5,
      });
      response = completion.data.choices[0].message.content;
      evaConversationHistory.push({ role: "assistant", content: response });
    }

    if (user) {
      user.evaConversationHistory = evaConversationHistory;
      await user.save();
    }

    newMsg =
      user.evaConversationHistory[user.evaConversationHistory.length - 1];
    res.status(200).json({ data: response, msgId: newMsg._id });
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
