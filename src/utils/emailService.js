const nodemailer = require('nodemailer');

const isConfigured = () =>
  process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendWelcomeEmail = async (user) => {
  if (!isConfigured()) return;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Event Management" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to Event Management!',
    text: `Hi ${user.name},\n\nYour account has been created successfully.\nRole: ${user.role}\n\nEvent Management Team`,
    html: `<p>Hi <strong>${user.name}</strong>,</p>
           <p>Your account has been created successfully.</p>
           <p>Role: <strong>${user.role}</strong></p>
           <p>Event Management Team</p>`,
  });
};

const sendEventRegistrationEmail = async (user, event) => {
  if (!isConfigured()) return;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Event Management" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Registration Confirmed: ${event.title}`,
    text: `Hi ${user.name},\n\nYou are registered for "${event.title}".\n\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location || 'TBD'}\n\nEvent Management Team`,
    html: `<p>Hi <strong>${user.name}</strong>,</p>
           <p>You are registered for <strong>${event.title}</strong>.</p>
           <ul>
             <li>Date: ${event.date}</li>
             <li>Time: ${event.time}</li>
             <li>Location: ${event.location || 'TBD'}</li>
           </ul>
           <p>Event Management Team</p>`,
  });
};

module.exports = { sendWelcomeEmail, sendEventRegistrationEmail };
