exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ Formspree already handled email on frontend
    // 🔒 Backend just acknowledges receipt

    return res.status(200).json({
      success: true,
      message: "Message received successfully",
    });
  } catch (error) {
    console.error("CONTACT CONTROLLER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
