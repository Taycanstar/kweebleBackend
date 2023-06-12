const express = require("express");
const router = require("express").Router();
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_NEW_API);
const sendEmail = require("../utils/email");

function sendFeedbackEmail(feedback) {
  const msg = {
    to: "support@kweeble.com", // Change to your email address
    from: "feedback@example.com", // Change to your send address
    subject: "New feedback received",
    text: `
      Feedback details:

      User ID: ${feedback.userId}
      Like: ${feedback.like}
      Dislike: ${feedback.dislike}
      Time: ${feedback.timestamp}
      Comment: ${feedback.text}
      Labels: ${feedback.labels}
    `,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error, "email not sent");
    });
}

//new feedback
router.post("/", async (req, res) => {
  const { userId, type, text, liked, disliked, labels } = req.body;

  try {
    await sendEmail({
      email: "support@kweeble.com",
      subject: "New Feedback",
      message: `UserId: ${userId}\n\ntype: ${type}\n\ntext: ${text}\n\nliked: ${liked}\n\n disliked: ${disliked}\n\nlabels: ${labels}`,
    });

    console.log({
      status: "success",
      message: "Email sent",
    });
  } catch (error) {
    console.log(error);
  }

  try {
    const feedback = new Feedback({
      userId,
      type,
      text,
      liked,
      disliked,
      labels,
    });

    // console.log(req.body, "lol");
    await feedback.save();

    return res
      .status(201)
      .json({ message: "feedback created succesfully", feedback });
  } catch (error) {
    res.send(error);
  }
});

//Fetch all feedback
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.send(feedbacks);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
