const Event = require("../models/Event");

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

const getEventsAtLocation = async (location) => {
  const regex = new RegExp(`^${location}$`, "i");
  const eventsAtLocation = await Event.find({ location: { $regex: regex } })
    .sort({ date: -1 })
    .limit(5);

  // Check if any events were found
  if (eventsAtLocation.length === 0) {
    return [`We couldn't find any events at ${location}.`];
  }

  return eventsAtLocation.map((event) => {
    const dateString = `${months[event.month - 1]} ${event.day}, ${event.year}`;
    return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
  });
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

const extractDate = (prompt) => {
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

const customResponses = {
  "upcoming events": ({ formattedEvents }) =>
    `Some upcoming events are:\n${formattedEvents}`,
  "latest events": ({ formattedEvents }) =>
    `Some latest events are:\n${formattedEvents}`,
  "new events": ({ formattedEvents }) =>
    `Some new events are:\n${formattedEvents}`,
  "recent events": ({ formattedEvents }) =>
    `Some recent events are:\n${formattedEvents}`,
  "music events": ({ keywordEvents }) =>
    `Some music events are:\n${keywordEvents}`,
  "fitness events": ({ keywordEvents }) =>
    `Some fitness events are:\n${keywordEvents}`,
  "family events": ({ keywordEvents }) =>
    `Some family events are:\n${keywordEvents}`,
  "tech events": ({ keywordEvents }) =>
    `Some tech events are:\n${keywordEvents}`,
  "drink events": ({ keywordEvents }) =>
    `Some drink events are:\n${keywordEvents}`,
  "craft events": ({ keywordEvents }) =>
    `Some craft events are:\n${keywordEvents}`,
  "sustainability events": ({ keywordEvents }) =>
    `Some sustainability events are:\n${keywordEvents}`,
  "crafting events": ({ keywordEvents }) =>
    `Some crafting events are:\n${keywordEvents}`,
  "sporting events": ({ keywordEvents }) =>
    `Some sporting events are:\n${keywordEvents}`,
  "pet-friendly events": ({ keywordEvents }) =>
    `Some pet-friendly events are:\n${keywordEvents}`,
  "outdoor events": ({ keywordEvents }) =>
    `Some outdoor events are:\n${keywordEvents}`,
  "poetry events": ({ keywordEvents }) =>
    `Some poetry events are:\n${keywordEvents}`,
  "literature events": ({ keywordEvents }) =>
    `Some literature events are:\n${keywordEvents}`,
  "fashion events": ({ keywordEvents }) =>
    `Some fashion events are:\n${keywordEvents}`,
  "sports events": ({ keywordEvents }) =>
    `Some sports events are:\n${keywordEvents}`,
  "comedy events": ({ keywordEvents }) =>
    `Some comedy events are:\n${keywordEvents}`,
  "baking events": ({ keywordEvents }) =>
    `Some baking events are:\n${keywordEvents}`,
  "gaming events": ({ keywordEvents }) =>
    `Some gaming events are:\n${keywordEvents}`,
  "diy events": ({ keywordEvents }) => `Some DIY events are:\n${keywordEvents}`,
  "cooking events": ({ keywordEvents }) =>
    `Some cooking events are:\n${keywordEvents}`,
  "quiet events": ({ keywordEvents }) =>
    `Some quiet events are:\n${keywordEvents}`,
  "photography events": ({ keywordEvents }) =>
    `Some photography events are:\n${keywordEvents}`,
  "cultural events": ({ keywordEvents }) =>
    `Some cultural events are:\n${keywordEvents}`,
  "relaxing events": ({ keywordEvents }) =>
    `Some relaxing events are:\n${keywordEvents}`,
  "networking events": ({ keywordEvents }) =>
    `Some networking events are:\n${keywordEvents}`,
  "astronomy events": ({ keywordEvents }) =>
    `Some astronomy events are:\n${keywordEvents}`,
  "language events": ({ keywordEvents }) =>
    `Some language events are:\n${keywordEvents}`,
  "tech events": ({ keywordEvents }) =>
    `Some tech events are:\n${keywordEvents}`,
  "political events": ({ keywordEvents }) =>
    `Some political events are:\n${keywordEvents}`,
  "science events": ({ keywordEvents }) =>
    `Some science events are:\n${keywordEvents}`,
  "business events": ({ keywordEvents }) =>
    `Some business events are:\n${keywordEvents}`,
  "anime events": ({ keywordEvents }) =>
    `Some anime events are:\n${keywordEvents}`,
  "comics events": ({ keywordEvents }) =>
    `Some comics events are:\n${keywordEvents}`,
  "health events": ({ keywordEvents }) =>
    `Some health events are:\n${keywordEvents}`,
  "photography events": ({ keywordEvents }) =>
    `Some photography events are:\n${keywordEvents}`,
  "wellness events": ({ keywordEvents }) =>
    `Some wellness events are:\n${keywordEvents}`,
  "community events": ({ keywordEvents }) =>
    `Some comumnity events are:\n${keywordEvents}`,
  "kids events": ({ keywordEvents }) =>
    `Some kids events are:\n${keywordEvents}`,
  "educational events": ({ keywordEvents }) =>
    `Some educational events are:\n${keywordEvents}`,
  "food events": ({ keywordEvents }) =>
    `Some food and drinking events are:\n${keywordEvents}`,
  "drinking events": ({ keywordEvents }) =>
    `Some food and drinking events are:\n${keywordEvents}`,
  "meditation events": ({ keywordEvents }) =>
    `Some wellness events are:\n${keywordEvents}`,
  "market events": ({ keywordEvents }) =>
    `Some community events are:\n${keywordEvents}`,
  "virtual events": ({ keywordEvents }) =>
    `Some virtual events are:\n${keywordEvents}`,
  "online events": ({ keywordEvents }) =>
    `Some online events are:\n${keywordEvents}`,
  "science events": ({ keywordEvents }) =>
    `Some science events are:\n${keywordEvents}`,
  "baseball events": ({ keywordEvents }) =>
    `Some baseball events are:\n${keywordEvents}`,
  "tennis events": ({ keywordEvents }) =>
    `Some tennis events are:\n${keywordEvents}`,
  "softball events": ({ keywordEvents }) =>
    `Some softball events are:\n${keywordEvents}`,
  "yoga events": ({ keywordEvents }) =>
    `Some yoga events are:\n${keywordEvents}`,
  "knitting events": ({ keywordEvents }) =>
    `Some knitting events are:\n${keywordEvents}`,
  "pilates events": ({ keywordEvents }) =>
    `Some pilates events are:\n${keywordEvents}`,
  "crypto events": ({ keywordEvents }) =>
    `Some crypto events are:\n${keywordEvents}`,
  "coding events": ({ keywordEvents }) =>
    `Some coding events are:\n${keywordEvents}`,
  "programming events": ({ keywordEvents }) =>
    `Some programming events are:\n${keywordEvents}`,
  "religious events": ({ keywordEvents }) =>
    `Some religious events are:\n${keywordEvents}`,
  "spiritual events": ({ keywordEvents }) =>
    `Some spiritual events are:\n${keywordEvents}`,
  "surfing events": ({ keywordEvents }) =>
    `Some surfing events are:\n${keywordEvents}`,
  "hiking events": ({ keywordEvents }) =>
    `Some hiking events are:\n${keywordEvents}`,
  "stargazing events": ({ keywordEvents }) =>
    `Some stargazing events are:\n${keywordEvents}`,
  "gardening events": ({ keywordEvents }) =>
    `Some gardening events are:\n${keywordEvents}`,
  "walking events": ({ keywordEvents }) =>
    `Some walking events are:\n${keywordEvents}`,
  "volleyball events": ({ keywordEvents }) =>
    `Some volleyball events are:\n${keywordEvents}`,
  "golf events": ({ keywordEvents }) =>
    `Some golf events are:\n${keywordEvents}`,
  "sailing events": ({ keywordEvents }) =>
    `Some sailing events are:\n${keywordEvents}`,
  "soccer events": ({ keywordEvents }) =>
    `Some soccer events are:\n${keywordEvents}`,
  "beach events": ({ keywordEvents }) =>
    `Some beach events are:\n${keywordEvents}`,
  "basketball events": ({ keywordEvents }) =>
    `Some basketball events are:\n${keywordEvents}`,
  "conference events": ({ keywordEvents }) =>
    `Some educational events are:\n${keywordEvents}`,
  "lecturing events": ({ keywordEvents }) =>
    `Some educational events are:\n${keywordEvents}`,
  "museum events": ({ keywordEvents }) =>
    `Some art events are:\n${keywordEvents}`,
  "eckerd events": ({ keywordEvents }) =>
    `Some Eckerd events are:\n${keywordEvents}`,
  "theater shows": ({ keywordEvents }) => `Some shows are:\n${keywordEvents}`,
  "free events": ({ keywordEvents }) =>
    `Some free events are:\n${keywordEvents}`,
  "art events": ({ keywordEvents }) => `Some art events are:\n${keywordEvents}`,
  "what is your name": () =>
    "As an AI language model developed by Kweeble, I don't have a personal name. You can simply refer to me as EVA (Events Virtual Assistant). How can I assist you today?",
  "what's your name": () =>
    "As an AI language model developed by Kweeble, I don't have a personal name. You can simply refer to me as EVA (Events Virtual Assistant). How can I assist you today?",
  "what is kweeble": () =>
    "Kweeble is a platform that connects you to everything going on around you.",
  "what's kweeble": () =>
    "Kweeble is a platform that connects you to everything going on around you.",
  "who created kweeble": () =>
    "Kweeble was created by Dimi, a guy who loves Christopher Nolan movies and playing the piano.",
  "when was kweeble created": () =>
    "Kweeble was launched for the first time on March 29, 2022 as a website. The mobile version was launched a year later on March 21, 2023.",

  "events at": async ({ prompt }) => {
    const location = extractLocation(prompt);
    const eventsAtLocation = await Event.find({
      location: { $regex: new RegExp(location, "i") },
    })
      .sort({ date: -1 })
      .limit(5);
    const formatEvents = eventsAtLocation
      .map((event) => {
        const dateString = `${months[event.month - 1]} ${event.day}, ${
          event.year
        }`;
        return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
      })
      .join("");
    console.log(eventsAtLocation, "locs");
    return `Here are some events happening at ${location}:\n${formatEvents}\n`;
  },
  "events on": async ({ prompt }) => {
    const date = extractDate(prompt);

    if (date) {
      // Create the end date by adding one day to the start date
      const endDate = new Date(date.getTime());
      endDate.setDate(endDate.getDate() + 1);

      // Retrieve events on the specified date
      const events = await Event.find({
        date: { $gte: date, $lt: endDate },
      }).limit(5);

      // Format the events into a string
      const eventsString = events
        .map((event) => {
          // const dateString = `${
          //   months[event.date.getMonth()]
          // } ${event.date.getDate()}, ${event.date.getFullYear()}`;
          const dateString = formatDate(new Date(event.date));
          return `◦ ${event.name} at ${event.location} on ${dateString}\n`;
        })
        .join("");

      // // Format the date using the desired format
      // const formattedDate = formatDate(date);
      return `Here are some events happening on ${dateString}:\n${formatEvents}\n`;
      // return `Here are some events happening on ${formattedDate}:\n${eventsString}`;
    } else {
      return "Sorry, I couldn't understand the date format. Please try again with a different date format.";
    }
  },
  "events happening on": async ({ prompt }) => {
    const date = extractDate(prompt);

    if (date) {
      // Create the end date by adding one day to the start date
      const endDate = new Date(date.getTime());
      endDate.setDate(endDate.getDate() + 1);

      // Retrieve events on the specified date
      const events = await Event.find({
        date: { $gte: date, $lt: endDate },
      }).limit(5);

      // Format the events into a string
      const eventsString = events
        .map((event) => {
          // const dateString = `${
          //   months[event.date.getMonth()]
          // } ${event.date.getDate()}, ${event.date.getFullYear()}`;
          const dateString = formatDate(new Date(event.date));
          return `◦ ${event.name} at ${event.location} on ${dateString}\n`;
        })
        .join("");

      // // Format the date using the desired format
      // const formattedDate = formatDate(date);
      return `Here are some events happening on ${dateString}:\n${formatEvents}\n`;
      // return `Here are some events happening on ${formattedDate}:\n${eventsString}`;
    } else {
      return "Sorry, I couldn't understand the date format. Please try again with a different date format.";
    }
  },
  newThisWeek: async ({ keywordEvents }) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newEvents = await Event.find({ date: { $gte: oneWeekAgo } })
      .sort({ date: -1 })
      .limit(5);

    if (newEvents.length === 0) {
      return `No new events were added this week.`;
    } else {
      const formattedNewEvents = newEvents
        .map((event, index) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some new events added this week:\n${formattedNewEvents}\n`;
    }
  },
  "events for a date night": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any events for a date night.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some events suitable for a date night:\n${formattedKeywordEvents}\n`;
    }
  },
  "book club meetings": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any book club meetings.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some book club meetings:\n${formattedKeywordEvents}\n`;
    }
  },
  "mental health events": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any mental health events.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some mental health events:\n${formattedKeywordEvents}\n`;
    }
  },
  "tea tasting events": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any tea tasting events.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some tea tasting events:\n${formattedKeywordEvents}\n`;
    }
  },
  "mental health awareness": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any mental health awareness events.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some mental health awareness events:\n${formattedKeywordEvents}\n`;
    }
  },
  "events for seniors": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any events for seniors.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some events for seniors:\n${formattedKeywordEvents}\n`;
    }
  },
  "events for college students": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any events for college students.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some events for college students:\n${formattedKeywordEvents}\n`;
    }
  },
  "events for animal-lovers": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any events for animal-lovers.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some events for animal-lovers:\n${formattedKeywordEvents}\n`;
    }
  },
  "car shows": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any car shows.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some car shows:\n${formattedKeywordEvents}\n`;
    }
  },
  "automotive events": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any automotive events.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some automotive events:\n${formattedKeywordEvents}\n`;
    }
  },

  "date night events": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any date night events.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some date night events:\n${formattedKeywordEvents}\n`;
    }
  },

  "events for adventure-seekers": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any events for adventure seekers.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some events adventure-seekers:\n${formattedKeywordEvents}\n`;
    }
  },
  "events for adventure seekers": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any events for adventure seekers.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some events adventure-seekers:\n${formattedKeywordEvents}\n`;
    }
  },

  "events featuring": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `We couldn't find any events featuring .`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some events featuring:\n${formattedKeywordEvents}\n`;
    }
  },
  "women-only": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `We couldn't find any women-only events .`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some women-only events:\n${formattedKeywordEvents}\n`;
    }
  },
  "events for only women": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `We couldn't find any women-only events .`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some women-only events:\n${formattedKeywordEvents}\n`;
    }
  },
  "events celebrating": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `We couldn't find any events featuring .`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some events celebrating:\n${formattedKeywordEvents}\n`;
    }
  },
  "romantic events": async ({ keywordEvents }) => {
    if (keywordEvents.length === 0) {
      return `Sorry, we couldn't find any romantic events.`;
    } else {
      const formattedKeywordEvents = keywordEvents
        .map((event) => {
          const dateString = `${months[event.month - 1]} ${event.day}, ${
            event.year
          }`;
          return `◦ ${event.name} at ${event.location} on ${dateString}.\n`;
        })
        .join("\n");
      return `Here are some romantic events:\n${formattedKeywordEvents}\n`;
    }
  },
};

module.exports = customResponses;
