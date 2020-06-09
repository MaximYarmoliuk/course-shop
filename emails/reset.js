module.exports = function (email, token) {
  return {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: "Access recovery",
    html: `
            <h1>Forgot password?</h1>
            <p>If not, ignore this letter</p>
            <p><a href="${process.env.SERVER_BASE_URL}/auth/password/${token}">Reset access</a>
            <hr />
            <a href="${process.env.SERVER_BASE_URL}">Shop of courses</a>
            `,
  };
};
