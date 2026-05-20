const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000; // ✅ backend standard
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
