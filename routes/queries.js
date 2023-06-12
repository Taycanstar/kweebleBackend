const axios = require("axios");
const express = require("express");
const router = require("express").Router();
const { MongoClient } = require("mongodb");
const Event = require("../models/Event");
const { Configuration, OpenAIApi } = require("openai");
const customResponses = require("../utils/customResponses");
const keywords = require("../utils/keywords");
const User = require("../models/User"); // Assuming you have a User model
const countTokens = require("../utils/tokenCount");
const { get_encoding } = require("@dqbd/tiktoken");

const encoding = get_encoding("cl100k_base");

const MAX_TOKENS = 4096;

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

const MAX_CONVO_LENGTH = 10; // Maximum number of messages to keep in the conversation history

const extractLocation = (prompt) => {
  const matches = prompt.match(/events at ([^.?]+)/i);
  if (matches && matches.length > 1) {
    return matches[1].trim();
  }
  return null;
};

const extractDate = (prompt) => {
  // const matches = prompt.match(/events on (.+)/i);
  const matches = prompt.match(/events (happening )?on (.+)/i);
  if (matches && matches.length > 1) {
    const dateString = matches[2].trim();

    // Try direct parsing, which works for many formats (e.g. YYYY-MM-DD)
    let date = new Date(dateString);
    if (isValidDate(date)) {
      return date;
    }

    // Add additional format checks as needed
    const formatChecks = [
      { format: "M-D-YYYY", regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/ },
      // ... other formats
    ];

    for (let check of formatChecks) {
      const parts = check.regex.exec(dateString);
      if (parts) {
        date = new Date(parts[3], parts[1] - 1, parts[2]); // Note: month is 0-based
        if (isValidDate(date)) {
          return date;
        }
      }
    }
  }

  return null;
};

const extractDate2 = (prompt) => {
  const matches = prompt.match(/events on (.+)/i);
  if (matches && matches.length > 1) {
    const dateString = matches[1].trim();

    // Try direct parsing, which works for many formats (e.g. YYYY-MM-DD)
    let date = new Date(dateString);
    if (isValidDate(date)) {
      return date;
    }

    // Add additional format checks as needed
    const formatChecks = [
      { format: "M-D-YYYY", regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/ },
      // ... other formats
    ];

    for (let check of formatChecks) {
      const parts = check.regex.exec(dateString);
      if (parts) {
        date = new Date(parts[3], parts[1] - 1, parts[2]); // Note: month is 0-based
        if (isValidDate(date)) {
          return date;
        }
      }
    }
  }

  return null;
};

const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

const formatDate = (date) => {
  const monthNames = [
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

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return monthNames[monthIndex] + " " + day + ", " + year;
};

router.post("/new", async (req, res) => {
  const { prompt, userId } = req.body;
  let evaConversationHistory = [];
  let wasChatEmpty;

  const user = await User.findById(userId);

  if (user && user.evaConversationHistory) {
    evaConversationHistory = user.evaConversationHistory;
    // Truncate the conversation history if it exceeds the maximum length
    // if (evaConversationHistory.length > MAX_CONVO_LENGTH) {
    //   evaConversationHistory = evaConversationHistory.slice(
    //     evaConversationHistory.length - MAX_CONVO_LENGTH
    //   );
    // }
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
      keywordEvents = [`We couldn't find any events.`];
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
        } else if (
          keyword === "events on" ||
          keyword === "events happening on"
        ) {
          const date = extractDate(prompt);

          if (date) {
            const startDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            );
            const endDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() + 1
            );

            const events = await Event.find({
              date: { $gte: startDate, $lt: endDate },
            }).limit(5);

            if (events.length === 0) {
              response = `We couldn't find any events on ${formatDate(date)}.`;
            } else {
              const formatEvents = events
                .map((event) => {
                  const dateString = `${months[event.month - 1]} ${
                    event.day
                  }, ${event.year}`;
                  return `◦ ${event.name} at ${event.location} on ${dateString}\n`;
                })
                .join("");
              const dateString = formatDate(new Date(date));
              response = `Here are some events happening on ${dateString}:\n${formatEvents}\n`;
            }
          } else {
            response = "The provided date is not valid.";
          }
          // continue;
        } else if (keyword === "new events this week") {
          response = customResponses.newThisWeek(data);
        } else if (
          keyword === "events for a date night" ||
          keyword === "date night events" ||
          keyword === "romantic events"
        ) {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any events for a date night.`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some events suitable for a date night:\n${formattedKeywordEvents}\n`;
          }
        } else if (keyword === "events featuring") {
          const matches = prompt.match(/events featuring (.+)/i);
          if (matches && matches.length > 1) {
            let artist = matches[1].trim();

            // Remove trailing question mark if present
            artist = artist.replace(/\?+$/, "");

            const keywordEvents = await Event.find({
              $or: [
                { name: { $regex: artist, $options: "i" } },
                { description: { $regex: artist, $options: "i" } },
              ],
            })
              .sort({ date: -1 })
              .limit(5);

            if (keywordEvents.length === 0) {
              response = `We couldn't find any events featuring ${artist}.`;
            } else {
              const formattedKeywordEvents = keywordEvents
                .map((event) => {
                  const dateString = `${months[event.month - 1]} ${
                    event.day
                  }, ${event.year}`;
                  return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
                })
                .join("\n");
              response = `Here are some events featuring ${artist}:\n${formattedKeywordEvents}\n`;
            }
          }
        } else if (keyword === "events celebrating") {
          const matches = prompt.match(/events celebrating (.+)/i);
          if (matches && matches.length > 1) {
            let artist = matches[1].trim();

            // Remove trailing question mark if present
            artist = artist.replace(/\?+$/, "");

            const keywordEvents = await Event.find({
              $or: [
                { name: { $regex: artist, $options: "i" } },
                { description: { $regex: artist, $options: "i" } },
              ],
            })
              .sort({ date: -1 })
              .limit(5);

            if (keywordEvents.length === 0) {
              response = `We couldn't find any events celebrating ${artist}.`;
            } else {
              const formattedKeywordEvents = keywordEvents
                .map((event) => {
                  const dateString = `${months[event.month - 1]} ${
                    event.day
                  }, ${event.year}`;
                  return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
                })
                .join("\n");
              response = `Here are some events celebrating ${artist}:\n${formattedKeywordEvents}\n`;
            }
          }
        } else if (
          keyword === "events for adventure-seekers" ||
          keyword === "events for adventure seekers"
        ) {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any events for adventure-seekers.`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some events for adventure-seekers:\n${formattedKeywordEvents}\n`;
          }
        } else if (
          keyword === "events for seniors" ||
          keyword === "senior events"
        ) {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any events for seniors.`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some events for seniors:\n${formattedKeywordEvents}\n`;
          }
        } else if (
          keyword === "college students events" ||
          keyword === "events for college students"
        ) {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any events for college students.`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some events for college students:\n${formattedKeywordEvents}\n`;
          }
        } else if (
          keyword === "women-only" ||
          keyword === "events for only women"
        ) {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any women-only events`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some women-only events:\n${formattedKeywordEvents}\n`;
          }
        } else if (
          keyword === "events for animal-lovers" ||
          keyword === "events for animal lovers" ||
          keyword === "animal-lovers events" ||
          keyword === "animal lovers events"
        ) {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any animal-lovers events`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some animal-lovers events:\n${formattedKeywordEvents}\n`;
          }
        } else if (keyword === "car shows" || keyword === "automotive events") {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any automotive events.`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some automotive events:\n${formattedKeywordEvents}\n`;
          }
        } else if (keyword === "book club meetings") {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any book club meetings.`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some book club meetings:\n${formattedKeywordEvents}\n`;
          }
        } else if (
          keyword === "mental health events" ||
          keyword === "mental health awareness"
        ) {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any mental health events.`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some mental health events:\n${formattedKeywordEvents}\n`;
          }
        } else if (
          keyword === "tea tasting events" ||
          keyword === "tea-tasting events" ||
          keyword === "tea related events" ||
          keyword === "tea events"
        ) {
          const keywordEvents = await Event.find({
            $text: { $search: keywords[keyword] },
          })
            .sort({ date: -1 })
            .limit(5);

          if (keywordEvents.length === 0) {
            response = `We couldn't find any events for seniors.`;
          } else {
            const formattedKeywordEvents = keywordEvents
              .map((event) => {
                const dateString = `${months[event.month - 1]} ${event.day}, ${
                  event.year
                }`;
                return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
              })
              .join("\n");
            response = `Here are some events for seniors:\n${formattedKeywordEvents}\n`;
          }
        } else {
          response = customResponses[keyword](data);
        }
        evaConversationHistory.push({ role: "assistant", content: response });
        break;
      }
    }

    if (!response) {
      evaConversationHistory.push({
        role: "user",
        content: prompt,
      });

      let tokenizedMessages = evaConversationHistory.map((message) => {
        let tokens = encoding.encode(message.content);
        return {
          role: message.role,
          tokens: tokens,
          tokenCount: tokens.length,
        };
      });

      let totalTokens = 0;
      let indexToSliceFrom = tokenizedMessages.length;

      for (let i = tokenizedMessages.length - 1; i >= 0; i--) {
        let message = tokenizedMessages[i];
        if (totalTokens + message.tokenCount > MAX_TOKENS) {
          break;
        }

        totalTokens += message.tokenCount;
        indexToSliceFrom = i;
      }

      const newConvo = evaConversationHistory.map(({ role, content }) => {
        return { role, content };
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
    res.status(400).json(error.response.data);
    // if (error.response) {
    //   console.log(error.response.status, "status");
    console.log(error.response.data, "data");
    // } else {
    //   console.log(error.message);
    // }
  }
});

module.exports = router;
