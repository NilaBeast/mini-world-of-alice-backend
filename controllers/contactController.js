const nodemailer = require("nodemailer");

// ✅ Brevo SMTP Transporter (Production-safe)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    await transporter.sendMail({
      from: `"Mini World of Alice" <${process.env.BREVO_USER}>`,
      to: process.env.BREVO_USER,
      replyTo: email,
      subject: `New Contact Request from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${service ? `<p><strong>Service:</strong> ${service}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ BREVO EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Email service unavailable",
    });
  }
};
