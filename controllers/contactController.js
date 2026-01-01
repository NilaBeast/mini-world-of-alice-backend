const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await transactionalApi.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER,
        name: "Mini World of Alice",
      },
      to: [{ email: process.env.BREVO_SENDER }],
      replyTo: { email },
      subject: `New Contact Request from ${name}`,
      htmlContent: `
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
  console.error("❌ BREVO API ERROR FULL OBJECT:", error);
  console.error("❌ BREVO API ERROR MESSAGE:", error?.message);
  console.error("❌ BREVO API ERROR BODY:", error?.response?.body);
  console.error("❌ BREVO API ERROR RESPONSE:", error?.response);

  return res.status(500).json({
    message: error?.response?.body?.message ||
             error?.message ||
             "Email service unavailable",
  });
}

};
