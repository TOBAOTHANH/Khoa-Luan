const app = require("./app");
const connectDatabase = require("./db/Database");
 // Cho phép tất cả các nguồn

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
const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT}`
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
