const nodemailer = require("nodemailer");
require("dotenv").config();
console.log("starting email");
// const sendgridTransport = require("nodemailer-sendgrid-transport");
const sendgrid = require("nodemailer-sendgrid");
console.log("started email");
const sendEmail = async (options) => {
  //1 create a transporter
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });
  console.log("before transporter");
  const transporter = nodemailer.createTransport(
    sendgrid({
      apiKey: process.env.SENDGRID_API,
    })
  );
  console.log("after transporter", process.env.SENDGRID_API);
  const from = "Kweeble <dimerson@kweeble.com>";
  //2 define the email options
  const mailOptions = {
    from,
    // from: 'Dimerson <diminunez06@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  console.log({ mailOptions });
  //3 actually send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("this didn't work so well", JSON.stringify(error, null, 2));
    throw error;
  }
};

module.exports = sendEmail;
