const app = require("./app");
const connectDatabase = require("./db/Database");

//handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
});

// config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: "./backend/config/.env",
  });
}

//connecting to database
connectDatabase();

// server
const server = app.listen(process.env.PORT || 8000, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT || 8000}`
  );
});

// unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Shutdown the server for ${err.message}`);
  console.log(`shuting down the server due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});

// Export backend_url for use in other files
const isProduction = process.env.NODE_ENV === "production";
const backend_url = isProduction
  ? process.env.BACKEND_URL || "https://khoa-luan-ipa8.onrender.com/"
  : process.env.BACKEND_URL || "http://localhost:8000/";

module.exports = {
  backend_url,
};
