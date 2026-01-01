const axios = require("axios");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const brevoResponse = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.BREVO_SENDER,
          name: "Mini World of Alice",
        },
        to: [
          {
            email: process.env.BREVO_SENDER, // you receive mail here
            name: "Admin",
          },
        ],
        replyTo: {
          email,
          name,
        },
        subject: `New Contact Request from ${name}`,
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 15000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      brevoMessageId: brevoResponse.data.messageId,
    });
  } catch (error) {
    console.error("❌ BREVO RAW API ERROR:");
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      message:
        error.response?.data?.message ||
        error.message ||
        "Email service failed",
    });
  }
};
