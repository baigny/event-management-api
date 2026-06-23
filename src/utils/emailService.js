const sendWelcomeEmail = (email, name) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Email sent to ${email}: Welcome, ${name}!`);
      resolve(true);
    }, 300);
  });

const sendEventRegistrationEmail = (email, name, eventTitle) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Email sent to ${email}: Registered for "${eventTitle}", ${name}!`);
      resolve(true);
    }, 300);
  });

module.exports = { sendWelcomeEmail, sendEventRegistrationEmail };
