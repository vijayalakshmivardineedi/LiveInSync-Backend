const emailValidator = require('email-validator');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use the email service you prefer
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use the App Password here
  },
});

// Send an email
const sendEmail = (to, subject, text, res, attachments) => {
  if (!emailValidator.validate(to)) {
    console.error('Invalid email address:', to);
    return;
  }

  const mailOptions = {
    from: 'vijju.vardi@gmail.com',
    to: to,
    subject: subject,
    html: text,
    
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      if (error.responseCode && error.responseCode === 554) {
        console.error('Invalid recipient address:', to);
      } else if (error.response && error.response.includes('not found')) {
        console.error('Recipient email address not found:', to);
      } else {
        console.error('Email not sent:', error);
      }
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

};


const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD, // Use your email password from .env
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
};


const sendEmailNotification = function(to, subject, text, res, successMessage, errorMessage) {
  const emailPromises = [];

  to.forEach((recipient) => {
    const to = recipient.email;

    // Use the sendEmail function to send the email
    const emailPromise = sendEmail(to, subject, text);
    emailPromises.push(emailPromise);
  });

  // Log the number of emails being sent
  console.log(`Sending ${emailPromises.length} email notifications...`);

  // Wait for all email promises to complete
  Promise.all(emailPromises)
    .then(() => {
      console.log('All email notifications sent successfully.');
      res.send(successMessage);
    })
    .catch((error) => {
      console.error("Error sending emails:", error);
      res.status(500).send(errorMessage);
    });
}

module.exports = { sendEmail, imapConfig, sendEmailNotification};