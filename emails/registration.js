module.exports = function (email) {
  return {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: "Successful registration",
    html: `
        <h1>Welcome to our shop</h1>
        <p>Account with email - ${email} created successfully! </p>
        <hr />
        <a href="${process.env.SERVER_BASE_URL}">Shop of courses</a>
        `,
  };
};
