const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10000, // 🔥 prevent hanging
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔥 Verify INSIDE request (safer on Render)
    await transporter.verify();

    await transporter.sendMail({
      from: `"Mini World of Alice" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
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
    console.error("❌ EMAIL ERROR:", error.message);

    return res.status(500).json({
      message: error.message || "Email service unavailable",
    });
  }
};
