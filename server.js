const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const coworkings = require("./routes/coworkings");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

app.use("/api/project/coworkings", coworkings);
app.use("/api/project/auth", auth);
app.use("/api/project/appointments", appointments);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server runing in`, process.env.NODE_ENV, `mode on port`, PORT)
);

// Handle unhandle promise rejections
process.on(`unhandledRejection`, (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Colse server & exit process
  server.close(() => process.exit(1));
});

/*
{
    "name":"Samyan CO-OP",
    "address":"2nd Floor Samyan Mitrtown",
    "district":"Pathumwan",
    "province":"Bangkok",
    "postalcode":"10330",
    "telephone":"02-2196999",
    "region":"กรุงเทพมหานคร (Bangkok)"
}
*/
