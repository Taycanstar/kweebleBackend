var postmark = require("postmark");
require("dotenv").config();

// const api = process.env.POSTMARK_API_TOKEN;

const sendEmail = async (options) => {
  // Send an email:
  var client = new postmark.ServerClient(
    "a05383dc-cd14-41ac-9278-9609734bac8f"
  );

  client.sendEmail({
    From: "noreply@kweeble.com",
    To: options.email,
    Subject: options.subject,
    HtmlBody: options.message,
    TextBody: options.message,
    MessageStream: "ResetPassword",
  });
};

module.exports = sendEmail;
